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
} from 'o1js';
// we need the initiate tree root in order to tell the contract about our off-chain storage
let initialCommitment: Field = Field(0);

export class GroupSettings extends Struct({
  maxMembers: UInt32,
  itemPrice: UInt32,
  groupDuration: UInt32,
  //maybe add tokenAddr here?
}) {
  constructor(maxMembers: UInt32, itemPrice: UInt32, groupDuration: UInt32) {
    super({ maxMembers, itemPrice, groupDuration });
  }
  hash(): Field {
    return Poseidon.hash(GroupSettings.toFields(this));
  }
  toFields(): Field[] {
    return GroupSettings.toFields(this);
  }
}

export class GroupBasic extends SmartContract {
  // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
  @state(Field) merkleRoot = State<Field>();
  @state(Field) groupSettingsHash = State<Field>();
  @state(PublicKey) admin = State<PublicKey>();
  @state(Field) paymentRound = State<Field>();
  @state(PublicKey) tokenAddress = State<PublicKey>();

  // state ipfs hash?

  deploy(args: DeployArgs & { tokenAddress: PublicKey; admin: PublicKey }) {
    super.deploy(args);
    this.tokenAddress.set(args.tokenAddress);
    this.admin.set(args.admin);
    this.merkleRoot.set(initialCommitment);
    this.paymentRound.set(Field(0));
  }

  @method async setGroupSettings(groupSettings: GroupSettings) {
    this.groupSettingsHash.set(groupSettings.hash());
  }

  @method async makePayment(_groupSettings: GroupSettings) {
    let groupSettingsHash = this.groupSettingsHash.getAndRequireEquals();
    groupSettingsHash.assertEquals(_groupSettings.hash());
    let paymentAmount = _groupSettings.itemPrice
      .div(_groupSettings.maxMembers)
      .mul(new UInt32(2)); // 2 items per payment round
    Provable.log('paymentAmount', paymentAmount);
  }
}
