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
  assert,
} from 'o1js';
import { FungibleToken } from './token/FungibleToken';
import {
  GroupUserStorage,
  groupStorageIndexes as indexes,
} from './GroupUserStorage';
import { PackedBoolFactory } from './lib/packed-types/PackedBool';
import { Escrow } from './Escrow';

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
  /** It's auction if false */
  isLottery: Bool,
  /** Set to true if user up to date on payments */
  lotteryElligible: Bool,
}) {
  constructor(
    publicKey: PublicKey,
    message: UInt64,
    paymentRound: UInt64,
    isLottery: Bool,
    lotteryElligible: Bool
  ) {
    super({
      publicKey,
      message,
      paymentRound,
      isLottery,
      lotteryElligible,
    });
  }
  hash(): Field {
    return Poseidon.hash(Entry.toFields(this));
  }
  toFields(): Field[] {
    return Entry.toFields(this);
  }
}

const LOTTERY: Bool = Bool(true);
const AUCTION: Bool = Bool(false);

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

// Max payments capped by the proof size
const MAX_PAYMENTS = 200;
const MAX_UPDATES_WITH_ACTIONS = 20;
const MAX_ACTIONS_PER_UPDATE = 2;
export class GroupBasic extends TokenContract {
  /** Settings specified by the organiser. */
  @state(Field) groupSettingsHash = State<Field>();
  /** Also organiser. */
  @state(PublicKey) admin = State<PublicKey>();
  /** Contract's token account used to store money. */
  @state(PublicKey) escrow = State<PublicKey>();
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
    args: DeployArgs & {
      admin: PublicKey;
      groupSettings: GroupSettings;
      escrow: PublicKey;
    }
  ) {
    await super.deploy(args);
    this.admin.set(args.admin);
    this.escrow.set(args.escrow);
    // Set group hash
    this.groupSettingsHash.set(args.groupSettings.hash());
    this.paymentRound.set(UInt64.zero);

    // It does do something
    this.account.permissions.set({
      ...Permissions.default(),
      // editState: Permissions.none(),
      send: Permissions.impossible(),
      incrementNonce: Permissions.proofOrSignature(),
    });
  }

  @method
  async organiserWithdraw(_groupSettings: GroupSettings, withdraw: UInt32) {
    let sender = this.sender.getAndRequireSignature();
    let organiser = this.admin.getAndRequireEquals();
    // Assert organsier is calling
    sender.assertEquals(organiser);

    // Validate group settings
    await this.assertGroupHash(_groupSettings);

    // Ensure withdraw is a multiple of the item price
    withdraw.mod(_groupSettings.itemPrice).assertEquals(UInt32.zero);

    // // Transfer token to the caller
    // const token = new FungibleToken(_groupSettings.tokenAddress);

    // // withdraw the amount
    // // let receiverAu = this.send({ to: admin, amount: new UInt64(withdraw) }); //err with overflow, I guess it's wrong token?

    // // let receiverAu = token.send({
    // //   to: admin,
    // //   amount: new UInt64(withdraw),
    // // }); // doesnt transfer the tokens

    // // let receiverAu = token.internal.send({
    // //   from: this.address,
    // //   to: admin,
    // //   amount: new UInt64(withdraw),
    // // }); // doesnt transfer the tokens

    // // await token.transfer(this.address, admin, new UInt64(withdraw)); // fails due 'incrementNonce' because permission for this field is 'Signature', but the required authorization was not provided ???

    // // let adminAU = AccountUpdate.createSigned(admin, token.deriveTokenId()); // forces admin to sign
    // // adminAU.body.useFullCommitment = Bool(true); // admin signs full tx so that the signature can't be reused against them
    // // adminAU.send({ to: admin, amount: new UInt64(withdraw) });

    // // let the receiver update inherit token permissions from this contract
    // // receiverAu.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;

    // Need to call the escrow to withdraw
    let escrow = new Escrow(this.escrow.getAndRequireEquals());

    // await escrow.withdrawOptimized(new UInt64(withdraw));
  }

  @method
  async userClaim(_groupSettings: GroupSettings) {
    let senderAddr = this.sender.getAndRequireSignature();
    let userStorage = new GroupUserStorage(senderAddr, this.deriveTokenId());

    // Assert they can claim
    // let claim: Bool = userStorage.canClaim.get();
    userStorage.canClaim.get().assertEquals(true);

    // Fetch amount required by the user to pay if the user won by bidding
    let bidPayment = UInt64.fromFields([userStorage.bidPayment.get()]).mul(
      new UInt64(_groupSettings.itemPrice)
    );
    const token = new FungibleToken(_groupSettings.tokenAddress);

    // Pay the (potentially) outstanding amount
    await token.transfer(
      senderAddr,
      this.escrow.getAndRequireEquals(),
      bidPayment
    );

    // Set claimed to true
    const claimUpdate = AccountUpdate.create(senderAddr, this.deriveTokenId());
    AccountUpdate.setValue(
      claimUpdate.body.update.appState[indexes.claimed],
      Bool(true).toField()
    );
  }

  /** Called once at the start. User relinquishes ability to modify token account bu signing */
  @method async addUserToGroup(
    _groupSettings: GroupSettings,
    address: PublicKey,
    vk: VerificationKey
  ) {
    const groupUserStorageUpdate = this.internal.mint({ address, amount: 1 });
    this.approve(groupUserStorageUpdate); // TODO: check if this is needed

    // Check if caller is the admin
    let adminCaller: Bool = this.admin
      .getAndRequireEquals()
      .equals(this.sender.getAndRequireSignature());

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
        editState: Permissions.none(),
        send: Permissions.none(), // we don't want to allow sending - soulbound
      },
    };

    // Set for paritcipant
    AccountUpdate.setValue(
      groupUserStorageUpdate.body.update.appState[indexes.isParticipant], // isParticipant
      Provable.if(adminCaller, Bool(false), Bool(true)).toField()
    );

    groupUserStorageUpdate.requireSignature();
  }

  @method
  async testPayment(_groupSettings: GroupSettings) {
    // Payment to the contract
    let senderAddr = this.sender.getAndRequireSignature();
    const token = new FungibleToken(_groupSettings.tokenAddress);
    await token.transfer(
      senderAddr,
      this.escrow.getAndRequireEquals(),
      new UInt64(100)
    );
  }

  @method
  async roundPayment(
    _groupSettings: GroupSettings,
    amountOfBids: UInt64, // Can be zero
    amountOfPayments: UInt32 // Needs to cover this, and past ones
  ) {
    let senderAddr = this.sender.getAndRequireSignature();
    await this.assertGroupHash(_groupSettings);

    let userStorage = new GroupUserStorage(senderAddr, this.deriveTokenId());

    // Amount of payments needs to be larger than zero
    amountOfPayments.assertGreaterThan(UInt32.zero);

    // Ensure caller is a patricipant
    let isParticipant = userStorage.isParticipant.get();
    isParticipant.assertEquals(true);

    // Get payments and compensations arrays
    let compensationsBools: Bool[] = Payments.unpack(
      Payments.fromBools(Payments.unpack(userStorage.compensations.get()))
        .packed
    );
    let paymentsBools: Bool[] = Payments.unpack(
      Payments.fromBools(Payments.unpack(userStorage.payments.get())).packed
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
    // createSigned() is needed , create() deosnt cut it
    const update = AccountUpdate.create(senderAddr, this.deriveTokenId());
    this.approve(update);
    AccountUpdate.setValue(
      update.body.update.appState[indexes.payments],
      Payments.fromBoolsField(paymentsBools)
      // Field(69)
    );
    AccountUpdate.setValue(
      update.body.update.appState[indexes.compensations],
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

    // Provable.log('totalPay', totalPay);
    let totalPaymentsU64: UInt64 = new UInt64(totalPayments);

    // Pay the total amount
    const token = new FungibleToken(_groupSettings.tokenAddress);

    // Payment to the contract
    await token.transfer(
      senderAddr,
      this.escrow.getAndRequireEquals(),
      totalPay
    );

    // Provable.log('totalPaymentsU64', totalPaymentsU64);
    // Provable.log('currentPaymentRound', currentPaymentRound);

    // Can't paritcipate in lottery if they already won it
    let pickedAlready: Bool = userStorage.canClaim.get();

    // Lottery action
    this.reducer.dispatch(
      new Entry(
        senderAddr,
        UInt64.zero,
        currentPaymentRound,
        LOTTERY, // Flag for lottery action
        // Lottery entry only true, if total payment count equals this round (plus 1 as zero indexed)
        // Would break if overpayment happend somehow
        totalPaymentsU64
          // TODO is wrong, needs to be set to equal or larger for those that won auction
          .equals(currentPaymentRound.add(UInt64.one))
          .and(pickedAlready.equals(false))
      )
    );

    // Encrypt bidding info
    // let adminPubKey = this.admin.getAndRequireEquals();
    // let message = Encryption.encrypt(amountOfBids.toFields(), adminPubKey);
    // Provable.log('Sender address: ', senderAddr);

    // Auction action
    this.reducer.dispatch(
      new Entry(
        senderAddr,
        amountOfBids,
        currentPaymentRound,
        AUCTION, // Flag for auction action
        Bool(false)
      )
    );
    // UInt32.fromFields(Encryption.decrypt(message, adminPubKey));
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
    // let adminPubKey = this.admin.getAndRequireEquals();
    // adminPubKey.assertEquals(adminPrivKey.toPublicKey());

    let currentPaymentRound = this.paymentRound.getAndRequireEquals();
    // Provable.log('randomValue', randomValue);
    // get all actions
    //TODO add latest action hash that was called, and start from next onwards
    let actions = this.reducer.getActions();

    // prove that we know the correct action state
    this.account.actionState.requireEquals(actions.hash);
    let currentHighestBid = UInt64.zero;
    let auctionWinner: PublicKey = PublicKey.empty();
    let secondAuctionWinner: PublicKey = PublicKey.empty();
    let lotteryWinner: PublicKey = PublicKey.empty();
    let iter = actions.startIterating();
    let distanceFromRandom = Field.from(999);
    let currentDistance = Field.from(999);
    // iterate over actions of encrypted bids
    // decrypt the bid and assert earliest highest bid

    Provable.log('Winner index: ', randomValue);

    // Last address for ghost update
    let firstAddress: PublicKey = PublicKey.empty();

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

        // If this is loop i set the first address
        firstAddress = Provable.if(
          Field(i).equals(Field(0)),
          action.publicKey,
          firstAddress
        );

        // Provable.log('Action: ', action);

        let auctionCondition = action.message
          .greaterThan(currentHighestBid)
          .and(action.paymentRound.equals(currentPaymentRound))
          .and(action.isLottery.equals(Bool(false))); // Update type check: bid / auction

        auctionWinner = Provable.if(
          auctionCondition,
          action.publicKey,
          auctionWinner
        );

        // Provable.log('Auction winner: ', auctionWinner);
        currentHighestBid = Provable.if(
          auctionCondition,
          action.message,
          currentHighestBid
        );

        // Provable.log('Key from action: ', action.publicKey);
        let lotteryCondition = action.isLottery
          .and(action.paymentRound.equals(currentPaymentRound))
          .and(currentDistance.lessThan(distanceFromRandom))
          .and(action.lotteryElligible); // User is not behind on payments nor did they win already

        // Provable.log('Lottery condition: ', lotteryCondition);

        secondAuctionWinner = Provable.if(
          lotteryCondition,
          lotteryWinner,
          secondAuctionWinner
        );

        lotteryWinner = Provable.if(
          lotteryCondition,
          action.publicKey,
          lotteryWinner
        );

        // Provable.log('Lottery winner: ', lotteryWinner);
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

    // State to be kept as is in case of missing auction or lottery winner
    let dudStorage = new GroupUserStorage(firstAddress, this.deriveTokenId());
    let dudValue = dudStorage.canClaim.get();

    // If auction and lottery winners are the same, set auction winner to the second highest bidder
    auctionWinner = Provable.if(
      auctionWinner.equals(lotteryWinner),
      secondAuctionWinner,
      auctionWinner
    );

    // If no winner found, set first address for a ghost update for lottery
    let lotteryFound: Bool = Provable.if(
      lotteryWinner.equals(PublicKey.empty()),
      Bool(false),
      Bool(true)
    );

    // If no winner found, set first address for a ghost update for auction
    let auctionFound: Bool = Provable.if(
      auctionWinner.equals(PublicKey.empty()),
      Bool(false),
      Bool(true)
    );

    lotteryWinner = Provable.if(lotteryFound, lotteryWinner, firstAddress);
    auctionWinner = Provable.if(auctionFound, auctionWinner, firstAddress);

    const lotteryWinnerUpdate = AccountUpdate.create(
      lotteryWinner,
      this.deriveTokenId()
    );
    AccountUpdate.setValue(
      lotteryWinnerUpdate.body.update.appState[indexes.canClaim],
      Provable.if(lotteryFound, Bool(true), dudValue).toField()
    );

    const auctionWinnerUpdate = AccountUpdate.create(
      auctionWinner,
      this.deriveTokenId()
    );
    AccountUpdate.setValue(
      auctionWinnerUpdate.body.update.appState[indexes.canClaim],
      Provable.if(lotteryFound, Bool(true), dudValue).toField()
    );

    // Set bidding amount
    AccountUpdate.setValue(
      auctionWinnerUpdate.body.update.appState[indexes.bidPayment],
      // This might be wrong
      Provable.if(lotteryFound, currentHighestBid.toFields()[0], Field.from(0))
    );

    // Emit
    this.emitEvent('lottery-winner', lotteryWinner);
    this.emitEvent('auction-winner', auctionWinner);

    let advanceRound = Provable.if(
      lotteryWinner.equals(PublicKey.empty()),
      UInt64.zero,
      UInt64.one
    );

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

  // Testign helpers
  //**********************************************************************

  /** Function for testing only. Sets round to the provided number. */
  @method async roundUpdate(roundIndex: UInt64) {
    this.paymentRound.set(roundIndex);
  }
}
