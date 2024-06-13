import {
  Poseidon,
  Field,
  State,
  state,
  PublicKey,
  method,
  UInt32,
  VerificationKey,
  TokenContract,
  Struct,
  Signature,
  Permissions,
  Reducer,
  Bool,
  Provable,
  AccountUpdate,
  AccountUpdateForest,
  JsonProof,
  DeployArgs,
  ProofBase,
  Encryption,
  UInt64,
  PrivateKey,
  verify,
  Group,
  provable,
  assert,
} from 'o1js';
import { FungibleToken } from './token/FungibleToken';
import { GroupUserStorage } from './GroupUserStorage';
import { PackedBoolFactory } from './lib/packed-types/PackedBool';

import {
  ProofOfAgeProof,
  ProofOfSanctionsProof,
  ProofOfUniqueHumanProof,
  ProofOfNationalityProof,
} from 'idmask-zk-programs';

export class Payments extends PackedBoolFactory(251) {}
type CipherText = {
  publicKey: Group;
  cipherText: Field[];
};
export class Entry extends Struct({
  publicKey: PublicKey,
  // message: { //TODO
  //   publicKey: Group,
  //   cipherText: Field[],
  // },
  message: UInt64,
  paymentRound: UInt64,
  isLottery: Bool,
}) {
  constructor(
    publicKey: PublicKey,
    message: UInt64,
    paymentRound: UInt64,
    isLottery: Bool
  ) {
    super({
      publicKey,
      message,
      paymentRound,
      isLottery,
    });
  }
  hash(): Field {
    return Poseidon.hash(Entry.toFields(this));
  }
  toFields(): Field[] {
    return Entry.toFields(this);
  }
  // static empty<T extends new (...args: any) => any>(): InstanceType<T> {
  //   return new Entry(PublicKey.empty(), UInt64.zero, UInt64.zero) as any;
  // }

  // static from(publicKey: PublicKey, bid: UInt64, paymentRound: UInt64) {
  //   return new Entry(publicKey, bid, paymentRound);
  // }
}
export class GroupSettings extends Struct({
  members: UInt32,
  itemPrice: UInt32,
  /** In payment rounds */
  groupDuration: UInt32,
  /** Stablecoin token */
  tokenAddress: PublicKey,
  /** Number of payments that can be missed */
  missable: UInt32,
  /** Duration of each payment round in seconds */
  payemntDuration: UInt64,
}) {
  constructor(
    members: UInt32,
    itemPrice: UInt32,
    groupDuration: UInt32,
    tokenAddress: PublicKey,
    missable: UInt32,
    payemntDuration: UInt64
  ) {
    super({
      members,
      itemPrice,
      groupDuration,
      tokenAddress,
      missable,
      payemntDuration,
    });
  }
  hash(): Field {
    return Poseidon.hash(GroupSettings.toFields(this));
  }
  toFields(): Field[] {
    return GroupSettings.toFields(this);
  }
  static empty<T extends new (...args: any) => any>(): InstanceType<T> {
    return new GroupSettings(
      new UInt32(0),
      new UInt32(0),
      new UInt32(0),
      PublicKey.empty(),
      new UInt32(0),
      new UInt64(0)
    ) as any;
  }
}

// TODO add validation for group settings
const MAX_PAYMENTS = 200;
const MAX_UPDATES_WITH_ACTIONS = 20;
const MAX_ACTIONS_PER_UPDATE = 2;
export class GroupBasic extends TokenContract {
  /** Settings specified by the organiser. */
  @state(Field) groupSettingsHash = State<Field>();
  /** Also organiser. */
  @state(PublicKey) admin = State<PublicKey>();
  /** Current index of the payment. */
  @state(UInt64) paymentRound = State<UInt64>();
  /** Exact number of members needed for this group . */
  @state(UInt32) members = State<UInt32>();
  reducer = Reducer({ actionType: Entry });
  events = {
    'lottery-winner': PublicKey,
    'auction-winner': PublicKey,
  };

  @method async verifyAge(proof: ProofOfAgeProof) {
    // Assert user is 21 years old in order to purchase these pristinely well
    // preserved as well as operational Ottoman era musket
    // let age = proof.age.get();
    // let ageProof: UInt32 = new UInt32(fieldProod.publicInput[0]);
    // ageProof.assertGreaterThanOrEqual(new UInt32(21));
    // const { verificationKey } = await proofOfAge.compile();
    // const isProofValid = await verify(fieldProod, verificationKey);
  }

  @method
  async approveBase(updates: AccountUpdateForest): Promise<void> {
    this.checkZeroBalanceChange(updates);
    // TODO: event emission here
  }

  async deploy(
    args: DeployArgs & { admin: PublicKey; groupSettings: GroupSettings }
  ) {
    await super.deploy(args);
    this.admin.set(args.admin);
    // this.admin.set(args.groupSettings);
    // this.setGroupSettings(groupSettings);
    // Set group hash
    this.groupSettingsHash.set(args.groupSettings.hash());
    // this.account.permissions.set({
    //   ...Permissions.default(),
    //   editState: Permissions.none(),
    //   setTokenSymbol: Permissions.none(),
    //   //   editActionsState: Permissions.none(),
    //   send: Permissions.none(),
    //   receive: Permissions.none(),
    //   setPermissions: Permissions.none(),
    //   incrementNonce: Permissions.proofOrSignature(),
    // });
    this.paymentRound.set(UInt64.zero);
  }

  /** Called once at the start. User relinquishes ability to modify token account bu signing */
  @method async addUserToGroup(
    _groupSettings: GroupSettings,
    address: PublicKey,
    vk: VerificationKey
  ) {
    const groupUserStorageUpdate = this.internal.mint({ address, amount: 1 });
    this.approve(groupUserStorageUpdate); // TODO: check if this is needed

    // Check for correct settings given
    await this.assertGroupHash(_groupSettings);

    // Ensure new addition doesn't exceed max allowed
    let members = this.members.getAndRequireEquals();
    members.assertLessThan(_groupSettings.members);

    // Increment members
    this.members.set(members.add(UInt32.one));

    groupUserStorageUpdate.body.update.verificationKey = {
      isSome: Bool(true),
      value: vk,
    };
    groupUserStorageUpdate.body.update.permissions = {
      isSome: Bool(true),
      value: {
        ...Permissions.default(),
        // TODO test acc update for this with sig only
        editState: Permissions.proofOrSignature(),
        send: Permissions.impossible(), // we don't want to allow sending - soulbound
        // setVerificationKey: Permissions.proof(),
      },
    };
    AccountUpdate.setValue(
      groupUserStorageUpdate.body.update.appState[3], // isParticipant
      Bool(true).toField()
    );

    groupUserStorageUpdate.requireSignature();
  }

  @method
  async roundPayment(
    _groupSettings: GroupSettings,
    amountOfBids: UInt64, // Can be zero
    amountOfPayments: UInt32 // Needs to cover this, and past ones
  ) {
    let senderAddr = this.sender.getAndRequireSignature();
    await this.assertGroupHash(_groupSettings);

    let ud = new GroupUserStorage(senderAddr, this.deriveTokenId());

    // Amount of payments needs to be larger than zero
    amountOfPayments.assertGreaterThan(UInt32.zero);

    // Ensure caller is a patricipant
    let isParticipant = ud.isParticipant.get();
    isParticipant.assertEquals(true);

    // Get payments and compensations arrays
    let compensationsBools: Bool[] = Payments.unpack(
      Payments.fromBools(Payments.unpack(ud.compensations.get())).packed
    );
    let paymentsBools: Bool[] = Payments.unpack(
      Payments.fromBools(Payments.unpack(ud.payments.get())).packed
    );

    // Fetch current round index from contract
    let currentPaymentRound: UInt64 = this.paymentRound.getAndRequireEquals();

    // Tallys
    let paymentBatch: UInt32 = new UInt32(amountOfPayments);
    let totalPayments: UInt32 = UInt32.zero;
    let totalCompensations: UInt32 = UInt32.zero;

    // Total payments that includes compensations and payments
    // Basically I want to do a single loop that accomplishes everything
    for (let i = 0; i < MAX_PAYMENTS; i++) {
      // If either is true, then valid
      let roundPaid: Bool = paymentsBools[i].or(compensationsBools[i]);
      let iter = new UInt64(i);
      let pastMonth: Bool = iter.lessThan(currentPaymentRound);
      let currentMonth: Bool = iter.equals(currentPaymentRound);

      // If it is not future month and there is money left mark canPayCurrentRound as true
      let canPayCurrentRound: Bool = Provable.if(
        iter
          .lessThanOrEqual(currentPaymentRound)
          .and(paymentBatch.greaterThan(UInt32.zero)),
        Bool(true),
        Bool(false)
      );

      // Payment taken if round is unpaid and can be paid
      let payingCurrentRound: Bool = Provable.if(
        canPayCurrentRound.and(roundPaid.equals(false)),
        Bool(true),
        Bool(false)
      );

      // If payment is being taken set roundPaid to true
      roundPaid = Provable.if(payingCurrentRound, Bool(true), roundPaid);

      // If payment is being taken and it is current month set payments[i] to true, or keep as is
      paymentsBools[i] = Provable.if(
        payingCurrentRound.and(currentMonth),
        payingCurrentRound,
        paymentsBools[i]
      );

      // If payment taken and not the last mont set compensations[i] to true, or keep as is
      compensationsBools[i] = Provable.if(
        payingCurrentRound.and(pastMonth).and(paymentsBools[i].equals(false)),
        payingCurrentRound,
        compensationsBools[i]
      );

      // Add to total payments if this month has been paid for
      totalPayments = totalPayments.add(
        Provable.if(roundPaid, UInt32.one, UInt32.zero)
      );

      // Subtract from remaining payments
      paymentBatch = paymentBatch.sub(
        Provable.if(payingCurrentRound, UInt32.one, UInt32.zero)
      );

      // If compensation is true add to the comp tally
      // Also if payment marked false for this month TODO
      totalCompensations = totalCompensations.add(
        Provable.if(compensationsBools[i], UInt32.one, UInt32.zero)
      );
    }

    // If total compensations exceeds max allowed for the group reject
    totalCompensations.assertLessThan(_groupSettings.missable);

    // Cant pay unless the group is full
    let members = this.members.getAndRequireEquals();
    members.assertEquals(_groupSettings.members);

    // Write back payments and compensations to the token storage
    const update = AccountUpdate.createSigned(senderAddr, this.deriveTokenId());
    AccountUpdate.setValue(
      update.body.update.appState[0],
      Payments.fromBoolsField(paymentsBools)
    );
    AccountUpdate.setValue(
      update.body.update.appState[1],
      Payments.fromBoolsField(compensationsBools)
    );

    // Multiply rate by the total payments and bids being provided
    let rate: UInt64 = this.getPaymentAmount(_groupSettings);

    // If bids is more than zero, basically takes one extra payemnt
    let totalPay: UInt64 = rate.mul(
      Provable.if(
        amountOfBids.greaterThan(UInt64.zero),
        UInt64.one,
        UInt64.zero
      ).add(new UInt64(amountOfPayments))
    );

    Provable.log('totalPay', totalPay);
    let totalPaymentsU64: UInt64 = new UInt64(totalPayments);

    // Pay the total amount
    const token = new FungibleToken(_groupSettings.tokenAddress);
    await token.transfer(senderAddr, this.address, totalPay);
    this.reducer.dispatch(
      new Entry(
        senderAddr,
        UInt64.zero,
        currentPaymentRound,
        // Lottery entry only true, if total payment count equals this round
        totalPaymentsU64.equals(currentPaymentRound)
      )
    );

    //encrypt bidding info
    // let adminPubKey = this.admin.getAndRequireEquals();
    // let message = Encryption.encrypt(amountOfBids.toFields(), adminPubKey);

    this.reducer.dispatch(
      new Entry(senderAddr, amountOfBids, currentPaymentRound, Bool(false))
    );
    // UInt32.fromFields(Encryption.decrypt(message, adminPubKey));
    // adminPubKey;

    update.requireSignature();
  }
  //TODO are we saving last action's hash and using it everyy
  // mitigate the 'latest' most likley to win in underpaid group (eg 15/20 paid, rnd = 18 (15th has 5/20 chance))
  //^ iterate from last ? and flip Bools
  @method
  async getResults(
    _groupSettings: GroupSettings,
    adminPrivKey: PrivateKey,
    randomValue: Field // it has to be constraint to max updates 0-100
  ) {
    // let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    // groupSettingsHash.assertEquals(_groupSettings.hash());
    await this.assertGroupHash(_groupSettings);
    let adminPubKey = this.admin.getAndRequireEquals();
    adminPubKey.assertEquals(adminPrivKey.toPublicKey());

    let currentPaymentRound = this.paymentRound.getAndRequireEquals();
    // Provable.log('randomValue', randomValue);
    // get all actions
    //TODO add latest action hash that was called, and start from next onwards
    let actions = this.reducer.getActions();

    // prove that we know the correct action state
    this.account.actionState.requireEquals(actions.hash);
    let currentHighestBid = UInt64.zero;
    let auctionWinner: PublicKey = PublicKey.empty();
    let lotteryWinner: PublicKey = PublicKey.empty();
    let iter = actions.startIterating();
    let distanceFromRandom = Field.from(999);
    let currentDistance = Field.from(999);
    // iterate over actions of encrypted bids
    // decrypt the bid and assert earliest highest bid

    for (let i = 0; i < MAX_UPDATES_WITH_ACTIONS; i++) {
      //can i use i or should I use
      let iterIndex = Field.from(i);
      // let iterIndex = iter._index('next');
      let merkleActions = iter.next();
      let innerIter = merkleActions.startIterating();
      //based on the DISTANCE from random number, set the lottery winner
      // Provable.log(
      //   'currentDistance',
      //   currentDistance,
      //   'distanceFromRandom',
      //   distanceFromRandom
      // );
      // how far index is from vrf
      currentDistance = Provable.if(
        iterIndex.greaterThanOrEqual(randomValue),
        iterIndex.sub(randomValue),
        randomValue.sub(iterIndex)
      );

      for (let j = 0; j < MAX_ACTIONS_PER_UPDATE; j++) {
        //can I ensure order of action in an update
        let action = innerIter.next();

        let auctionCondition = action.message
          .greaterThan(currentHighestBid)
          .and(action.paymentRound.equals(currentPaymentRound))
          .and(action.isLottery.equals(Bool(false))); // Update type check: bid / auction

        auctionWinner = Provable.if(
          auctionCondition,
          action.publicKey,
          auctionWinner
        );
        currentHighestBid = Provable.if(
          auctionCondition,
          action.message,
          currentHighestBid
        );

        let lotteryCondition = action.isLottery
          .and(action.paymentRound.equals(currentPaymentRound))
          .and(currentDistance.lessThan(distanceFromRandom));

        lotteryWinner = Provable.if(
          lotteryCondition,
          action.publicKey,
          lotteryWinner
        );
        // UInt64.fromFields(Encryption.decrypt(action.message, adminPrivKey));
        distanceFromRandom = Provable.if(
          lotteryCondition,
          currentDistance,
          distanceFromRandom
        );
      }
      innerIter.assertAtEnd();
    }
    iter.assertAtEnd();
    // Provable.log('auctionWinner', auctionWinner);
    // Provable.log('lotteryWinner', lotteryWinner);
    // Provable.log('distanceFromRandom', distanceFromRandom);

    this.emitEvent('lottery-winner', lotteryWinner);
    this.emitEvent('auction-winner', auctionWinner);

    let advanceRound = Provable.if(
      lotteryWinner.equals(PublicKey.empty()),
      UInt64.zero,
      UInt64.one
    );

    //if auction winner == lottery winner, take 2nd closest to lottery winner ? TODO

    // Is this needed here?
    this.paymentRound.set(currentPaymentRound.add(advanceRound));
  }

  private getPaymentAmount(groupSettings: GroupSettings): UInt64 {
    return new UInt64(
      groupSettings.itemPrice.div(groupSettings.members).mul(new UInt32(2)) // 2 items per payment round
    );
  }

  /** Saves one line for repetitive assertion. */
  @method
  async assertGroupHash(groupSettings: GroupSettings) {
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(groupSettings.hash());
  }

  //TODO extraPayment() ?
  //TODO claimLottery()
  //TODO claimAuction()

  // Testign helpers
  //**********************************************************************

  /** Function for testing only. Sets round to the provided number. */
  @method async roundUpdate(roundIndex: UInt64) {
    this.paymentRound.set(roundIndex);
  }

  // /** Function for testing only. Fetches total missed payments for a given user. */
  // @method.returns(UInt32) async totalMissedHandle(
  //   user: PublicKey
  // ): Promise<UInt32> {
  //   return this.totalMissed(user);
  // }

  /** Function for testing only. Retrieves how many payments a given user has made. */
  // @method.returns(UInt32) async totalPaymentsHandle(
  //   user: PublicKey
  // ): Promise<UInt32> {
  //   return this.totalPayments(user);
  // }
}
