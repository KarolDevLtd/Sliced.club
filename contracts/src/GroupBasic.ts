import {
  SmartContract,
  Poseidon,
  Field,
  State,
  state,
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
} from 'o1js';
import { FungibleToken } from './token/FungibleToken';
// we need the initiate tree root in order to tell the contract about our off-chain storage
let initialCommitment: Field = Field(0);
type CipherText = {
  publicKey: Group;
  cipherText: Field[];
};
export class Auction extends Struct({
  publicKey: PublicKey,
  message: UInt64,
  paymentRound: UInt64,
}) {
  constructor(publicKey: PublicKey, bid: UInt64, paymentRound: UInt64) {
    super({ publicKey, message: bid, paymentRound });
  }
  hash(): Field {
    return Poseidon.hash(Auction.toFields(this));
  }
  toFields(): Field[] {
    return Auction.toFields(this);
  }
  static empty<T extends new (...args: any) => any>(): InstanceType<T> {
    return new Auction(PublicKey.empty(), UInt64.zero, UInt64.zero) as any;
  }

  // static from(publicKey: PublicKey, bid: UInt64, paymentRound: UInt64) {
  //   return new Auction(publicKey, bid, paymentRound);
  // }
}
export class GroupSettings extends Struct({
  maxMembers: UInt32,
  itemPrice: UInt32,
  groupDuration: UInt32,
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

export class GroupBasic extends SmartContract {
  // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
  @state(Field) merkleRoot = State<Field>();
  @state(Field) groupSettingsHash = State<Field>();
  @state(PublicKey) admin = State<PublicKey>();
  @state(UInt64) paymentRound = State<UInt64>();
  reducer = Reducer({ actionType: Auction });

  // state ipfs hash?

  async deploy(args: DeployArgs & { admin: PublicKey }) {
    super.deploy(args);
    this.admin.set(args.admin);
    this.merkleRoot.set(initialCommitment);
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
  async makePayment(_groupSettings: GroupSettings) {
    //TODO ensure user in the group
    let senderAddr = this.sender.getAndRequireSignature();
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());

    //TODO get payment round ensure not yet paid ? nullifier?
    let currentPaymentRound = this.paymentRound.getAndRequireEquals();
    let paymentAmount = this.getPaymentAmount(_groupSettings);
    // Provable.log('paymentAmount', paymentAmount);
    const token = new FungibleToken(_groupSettings.tokenAddress);
    await token.transfer(senderAddr, this.address, paymentAmount);
  }

  @method
  async getLotteryResult(_groupSettings: GroupSettings) {
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());

    this.paymentRound.set(this.paymentRound.getAndRequireEquals().add(1));
  }

  @method
  async joinAuction(_groupSettings: GroupSettings, amountOfBids: UInt64) {
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());
    let adminPubKey = this.admin.getAndRequireEquals();
    let senderPubKey = this.sender.getAndRequireSignature();
    let currentPaymentRound = this.paymentRound.getAndRequireEquals();
    let paymentAmount = this.getPaymentAmount(_groupSettings);
    const token = new FungibleToken(_groupSettings.tokenAddress);

    //get payment round ? 2nd nullfiier?

    //check if has the actual bidding amount
    let balance = await token.getBalanceOf(senderPubKey);

    balance.assertGreaterThanOrEqual(paymentAmount.mul(amountOfBids)); // compile doesnt like this

    //but transfer only single one
    await token.transfer(senderPubKey, this.address, paymentAmount);

    //encrypt bidding info
    let message = Encryption.encrypt(amountOfBids.toFields(), adminPubKey);
    // this.reducer.dispatch(
    //   new Auction(senderPubKey, message, currentPaymentRound)
    // );
    // UInt32.fromFields(Encryption.decrypt(message, adminPubKey));
    // adminPubKey;
  }

  @method
  async getAuctionResult(
    _groupSettings: GroupSettings,
    adminPrivKey: PrivateKey
  ) {
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());
    let adminPubKey = this.admin.getAndRequireEquals();
    adminPubKey.assertEquals(adminPrivKey.toPublicKey());

    // iterate over actions of encrypted bids
    // decrypt the bid and assert earliest highest bid
    //set winner?
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

  //for bid, we can take single deposit but can check if have bidded amount in wallet
}