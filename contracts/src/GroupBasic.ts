import {
  SmartContract,
  Poseidon,
  Field,
  State,
  state,
  assert,
  PublicKey,
  method,
  UInt32,
  MerkleWitness,
  Struct,
  Signature,
  Reducer,
  Bool,
  Provable,
  AccountUpdate,
  MerkleList,
  Nullifier,
  Circuit,
  MerkleMapWitness,
  MerkleMap,
  DeployArgs,
  Encryption,
  UInt64,
  PrivateKey,
  Group,
  Unconstrained,
} from 'o1js';
import { FungibleToken } from './token/FungibleToken';
// we need the initiate tree root in order to tell the contract about our off-chain storage
let initialCommitment: Field = Field(0);
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
  maxMembers: UInt32,
  itemPrice: UInt32,
  /** In payment rounds */
  groupDuration: UInt32,
  /** Stablecoin token */
  tokenAddress: PublicKey,
}) {
  constructor(
    maxMembers: UInt32,
    itemPrice: UInt32,
    groupDuration: UInt32,
    tokenAddress: PublicKey
  ) {
    super({ maxMembers, itemPrice, groupDuration, tokenAddress });
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
export class GroupBasic extends SmartContract {
  // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
  // @state(Field) merkleRoot = State<Field>(); //for group patricipants
  @state(Field) groupSettingsHash = State<Field>();
  @state(PublicKey) admin = State<PublicKey>();
  @state(UInt64) paymentRound = State<UInt64>();
  reducer = Reducer({ actionType: Entry });
  events = {
    'lottery-winner': PublicKey,
    'auction-winner': PublicKey,
  };
  // state ipfs hash?

  async deploy(args: DeployArgs & { admin: PublicKey }) {
    await super.deploy(args);
    this.admin.set(args.admin);
    // this.merkleRoot.set(initialCommitment);
    this.paymentRound.set(UInt64.zero);
    this.groupSettingsHash.set(GroupSettings.empty().hash());
  }

  @method
  async setGroupSettings(
    groupSettings: GroupSettings,
    signedSettings: Signature
  ) {
    let adminPubKey = this.admin.getAndRequireEquals();
    signedSettings.verify(adminPubKey, groupSettings.toFields());
    this.groupSettingsHash.set(groupSettings.hash());
  }

  @method
  async roundPayment(_groupSettings: GroupSettings, amountOfBids: UInt64) {
    //TODO ensure user in the group
    let senderAddr = this.sender.getAndRequireSignature();
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());

    const token = new FungibleToken(_groupSettings.tokenAddress);

    let currentPaymentRound = this.paymentRound.getAndRequireEquals();
    //TODO ensure payment round not yet paid ?
    let paymentAmount = this.getPaymentAmount(_groupSettings);
    //check if has the actual bidding amount
    let balance = await token.getBalanceOf(senderAddr);
    // Check ability to act out on bid if won
    balance.assertGreaterThanOrEqual(
      paymentAmount.mul(amountOfBids),
      'Not enough balance to cover potential bid payment'
    );

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
    // TODO what if win lottery but also auction

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

        //this may still be correct
        // lotteryWinner = Provable.if(
        //   action.message
        //     .equals(UInt64.zero)
        //     .and(action.paymentRound.equals(currentPaymentRound))
        //     .and(
        //       currentDistance
        //         .equals(Field(0))
        //         .or(currentDistance.lessThan(distanceFromRandom))
        //     ),
        //   action.publicKey,
        //   lotteryWinner
        // );
      }
      innerIter.assertAtEnd();
    }
    iter.assertAtEnd();
    // Provable.log('auctionWinner', auctionWinner);
    // Provable.log('lotteryWinner', lotteryWinner);
    // Provable.log('distanceFromRandom', distanceFromRandom);

    this.emitEvent('lottery-winner', lotteryWinner);
    this.emitEvent('auction-winner', auctionWinner);

    //TODO double check logic for this
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
      groupSettings.itemPrice.div(groupSettings.maxMembers).mul(new UInt32(2)) // 2 items per payment round
    );
  }
  //TODO extraPayment()
  //TODO joinGroup()
  //TODO claimLottery()
  //TODO claimAuction()
}
