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
} from 'o1js';
import { FungibleToken } from './token/FungibleToken';
// we need the initiate tree root in order to tell the contract about our off-chain storage
let initialCommitment: Field = Field(0);

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
  @state(Field) paymentRound = State<Field>();

  // state ipfs hash?

  async deploy(args: DeployArgs & { admin: PublicKey }) {
    super.deploy(args);
    this.admin.set(args.admin);
    this.merkleRoot.set(initialCommitment);
    this.paymentRound.set(Field(0));
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

    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    // this.groupSettingsHash.requireEquals(this.groupSettingsHash.get());
    groupSettingsHash.assertEquals(_groupSettings.hash());

    //TODO get payment round ensure not yet paid ? nullifier?
    let paymentAmount = this.getPaymentAmount(_groupSettings);
    // Provable.log('paymentAmount', paymentAmount);
    const token = new FungibleToken(_groupSettings.tokenAddress);
    token.transfer(
      this.sender.getAndRequireSignature(),
      this.address,
      paymentAmount
    );
  }

  @method
  async getLotteryResult(_groupSettings: GroupSettings) {
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());

    this.paymentRound.set(
      this.paymentRound.getAndRequireEquals().add(Field(1))
    );
  }

  @method
  async joinAuction(_groupSettings: GroupSettings, amountOfBids: UInt64) {
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());
    let adminPubKey = this.admin.getAndRequireEquals();
    let paymentAmount = this.getPaymentAmount(_groupSettings);
    const token = new FungibleToken(_groupSettings.tokenAddress);

    //get payment round ? 2nd nullfiier?

    //check if has the actual bidding amount
    // token
    //   .getBalanceOf(this.sender)
    //   .assertGreaterThanOrEqual(paymentAmount.mul(amountOfBids));// compile doesnt like this

    //but transfer only single one
    token.transfer(
      this.sender.getAndRequireSignature(),
      this.address,
      paymentAmount
    );

    //encrypt bidding info
    let message = Encryption.encrypt(amountOfBids.toFields(), adminPubKey);
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
