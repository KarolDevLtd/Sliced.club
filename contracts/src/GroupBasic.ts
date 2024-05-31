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
  DeployArgs,
  Encryption,
  UInt64,
  PrivateKey,
  Group,
  provable,
} from 'o1js';
import { FungibleToken } from './token/FungibleToken';
import { GroupUserStorage } from './GroupUserStorage';
import { PackedBoolFactory } from './lib/packed-types/PackedBool';

export class Payments extends PackedBoolFactory(250) {}
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
}) {
  constructor(
    members: UInt32,
    itemPrice: UInt32,
    groupDuration: UInt32,
    tokenAddress: PublicKey
  ) {
    super({ members, itemPrice, groupDuration, tokenAddress });
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
      PublicKey.empty()
    ) as any;
  }
}
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
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());

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
  async roundPayment(_groupSettings: GroupSettings, amountOfBids: UInt64) {
    let senderAddr = this.sender.getAndRequireSignature();
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());

    // Cant pay unless group is full
    let members = this.members.getAndRequireEquals();
    members.assertEquals(_groupSettings.members);

    Provable.log('Members', members);
    Provable.log('_groupSettings.members', _groupSettings.members);

    const token = new FungibleToken(_groupSettings.tokenAddress);
    let currentPaymentRound = this.paymentRound.getAndRequireEquals();
    let paymentAmount = this.getPaymentAmount(_groupSettings);
    //check if has the actual bidding amount
    // let balance = await token.getBalanceOf(senderAddr);
    // // Check ability to act out on bid if won
    // balance.assertGreaterThanOrEqual(
    //   paymentAmount.mul(amountOfBids),
    //   'Not enough balance to cover potential bid payment'
    // );

    // Mark of payment in the token account
    await this.paySegments(currentPaymentRound);

    // If bidding take one extra payment now
    paymentAmount = Provable.if(
      amountOfBids.greaterThan(new UInt64(0)),
      paymentAmount.mul(2),
      paymentAmount
    );
    // Provable.log('paymentAmount', paymentAmount);
    await token.transfer(senderAddr, this.address, paymentAmount);
    this.reducer.dispatch(
      new Entry(senderAddr, UInt64.zero, currentPaymentRound, Bool(true))
    );

    //encrypt bidding info
    // let adminPubKey = this.admin.getAndRequireEquals();
    // let message = Encryption.encrypt(amountOfBids.toFields(), adminPubKey);

    this.reducer.dispatch(
      new Entry(senderAddr, amountOfBids, currentPaymentRound, Bool(false))
    );
    // UInt32.fromFields(Encryption.decrypt(message, adminPubKey));
    // adminPubKey;
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
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());
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

    this.paymentRound.set(currentPaymentRound.add(advanceRound));
  }

  private getPaymentAmount(groupSettings: GroupSettings): UInt64 {
    return new UInt64(
      groupSettings.itemPrice.div(groupSettings.members).mul(new UInt32(2)) // 2 items per payment round
    );
  }

  /** Tick of a single payment round */
  private async paySegments(paymentRound: UInt64) {
    let senderAddr = this.sender.getAndRequireSignature();
    let ud = new GroupUserStorage(senderAddr, this.deriveTokenId());
    //ensure user is a patricipant
    let isParticipant = ud.isParticipant.get();
    isParticipant.assertEquals(Bool(true));
    //TODO ensure payment round not yet paid ?
    let paymentsField = ud.payments.get();
    const payments: Payments = Payments.fromBools(
      Payments.unpack(paymentsField)
    );
    // // // // Write to the month index provided
    let paymentsBools: Bool[] = Payments.unpack(payments.packed);
    // Iterate over all values and flip one only
    for (let i = 0; i < 240; i++) {
      let t: Bool = paymentsBools[i];
      let newWrite: Bool = Provable.if(
        new UInt64(i).equals(paymentRound),
        Bool(true),
        t
      );
      paymentsBools[i] = newWrite;
    }
    // Provable.log(
    //   'Pay seg paymentRound.value.value[0]: ',
    //   paymentRound.value.value[0]
    // );
    // Update payments
    const update = AccountUpdate.createSigned(senderAddr, this.deriveTokenId());
    AccountUpdate.setValue(
      update.body.update.appState[0],
      Payments.fromBoolsField(paymentsBools)
    );
    update.requireSignature();
  }

  /** Returns total payments made so far */
  private async totalPayments(user: PublicKey): Promise<UInt32> {
    // Extract compensations
    // let user: PublicKey = this.sender.getAndRequireSignature();
    let ud = new GroupUserStorage(user, this.deriveTokenId());
    let compensationsField = ud.compensations.getAndRequireEquals();
    const compensations: Payments = Payments.fromBools(
      Payments.unpack(compensationsField)
    );

    let compensationBools: Bool[] = Payments.unpack(compensations.packed);

    // Extract payments
    let paymentsField = ud.payments.getAndRequireEquals();
    const payments: Payments = Payments.fromBools(
      Payments.unpack(paymentsField)
    );

    let paymentsBools: Bool[] = Payments.unpack(payments.packed);

    // Variable for total payments tally
    let count: UInt32 = new UInt32(0);

    // Loop over both
    for (let i = 0; i < 240; i++) {
      let add_payments: UInt32 = Provable.if(
        paymentsBools[i].equals(true),
        new UInt32(1),
        new UInt32(0)
      );

      let add_compensation: UInt32 = Provable.if(
        compensationBools[i].equals(true),
        new UInt32(1),
        new UInt32(0)
      );

      // Add to the running sum
      count = count.add(add_payments).add(add_compensation);
    }

    // Add any overpayments
    return count;
  }

  /** Gate for lottery */
  private async lotteryAccess(currentSegment: Field): Promise<Bool> {
    // Get payments so far
    // const totalPayments: Field = await this.totalPayments();
    // // Return true if it equals current segment number
    // return totalPayments.equals(currentSegment);
    return Bool(true);
  }

  /** Make up for prior missed payments */
  @method
  async compensate(numberOfCompensations: UInt32) {
    // Need to ensure no missed payment, otherwise just call paySegments

    // TODO later ensure someone doesnt over-over compnensate near the end
    // Can trim numberOfCompensations to whats left to pay

    // Extract compensations
    let user: PublicKey = this.sender.getAndRequireSignature();
    let ud = new GroupUserStorage(user, this.deriveTokenId());
    let compensationsField = ud.compensations.getAndRequireEquals();
    const compensations: Payments = Payments.fromBools(
      Payments.unpack(compensationsField)
    );
    let compensationBools: Bool[] = Payments.unpack(compensations.packed);

    // Extract payments
    let paymentsField = ud.payments.getAndRequireEquals();
    const payments: Payments = Payments.fromBools(
      Payments.unpack(paymentsField)
    );

    let paymentsBools: Bool[] = Payments.unpack(payments.packed);

    // console.log('paymentsField', paymentsField);

    let swap: Bool;

    // Iterate over untill the end
    for (let i = 0; i < 240; i++) {
      // console.log('Loop vallue: ', paymentsBools[i]);
      // Change will occur if there is enough to pay and this month is to be paid
      swap = Provable.if(
        // Needs to be false for payments and compoensations
        paymentsBools[i]
          .equals(Bool(false))
          .and(compensationBools[i].equals(Bool(false))),
        Bool(true),
        Bool(false)
      );

      // Provable.log('numberOfCompensations left: ', numberOfCompensations);

      // Check if money left
      let doughLeft: Bool = numberOfCompensations.greaterThan(UInt32.zero);

      // Update array of compensations
      compensationBools[i] = Provable.if(
        swap.and(doughLeft),
        Bool(true),
        Bool(false)
      );

      // Set the amount to be subtracted
      let subAmount: UInt32 = Provable.if(
        swap.and(doughLeft),
        UInt32.one,
        UInt32.zero
      );

      // Provable.log('Sub amount: ', subAmount);

      // Deduct from numberOfCompensations
      numberOfCompensations = numberOfCompensations.sub(subAmount);
    }

    Provable.log('Comp train end: ', compensationBools);

    // Update compensations
    // ud.compensations.set(Payments.fromBoolsField(compensationBools));

    const update = AccountUpdate.createSigned(user, this.deriveTokenId());
    AccountUpdate.setValue(
      update.body.update.appState[2],
      Payments.fromBoolsField(compensationBools)
    );
  }

  //TODO extraPayment()
  //TODO claimLottery()
  //TODO claimAuction()

  // Testign helpers
  //**********************************************************************

  /** Function for testing only. Sets round to this. */
  @method async roundUpdate(roundIndex: UInt64) {
    this.paymentRound.set(roundIndex);
  }

  /** Function for testing only. Retrieves how many payments given user has made. */
  @method.returns(UInt32) async totalPaid(user: PublicKey): Promise<UInt32> {
    // let currentPaymentRound = this.paymentRound.getAndRequireEquals();
    return this.totalPayments(user);
  }
}
