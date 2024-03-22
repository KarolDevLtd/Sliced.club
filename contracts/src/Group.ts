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
  Field,
} from 'o1js';

class MyMerkleWitness extends MerkleWitness(96) {}
// constants for our static-sized provable code
const MAX_UPDATES_WITH_ACTIONS = 100;
const MAX_ACTIONS_PER_UPDATE = 2;
// class Account extends Struct({
//   publicKey: PublicKey,
//   depositMina: UInt32,
// }) {
//   hash(): Field {
//     return Poseidon.hash(Account.toFields(this));
//   }

//   addMina(depositMina: number) {
//     return new Account({
//       publicKey: this.publicKey,
//       depositMina: this.depositMina.add(depositMina),
//     });
//   }
// }
// we need the initiate tree root in order to tell the contract about our off-chain storage
let initialCommitment: Field = Field(0);

const { Actions } = AccountUpdate;

// in this example, an action is just a public key
// type Action = PublicKey;
// const Action = PublicKey;

// the actions within one account update are a Merkle list with a custom hash
const emptyHash = Actions.empty().hash;
const nextHash = (hash: Field, action: PublicKey) =>
  Actions.pushEvent({ hash, data: [] }, action.toFields()).hash;

class MerkleActions extends MerkleList.create(PublicKey, nextHash, emptyHash) {}

// the "action state" / actions from many account updates is a Merkle list
// of the above Merkle list, with another custom hash
let emptyActionsHash = Actions.emptyActionState();
const nextActionsHash = (hash: Field, actions: MerkleActions) =>
  Actions.updateSequenceState(hash, actions.hash);

class MerkleActionss extends MerkleList.create(
  MerkleActions.provable,
  nextActionsHash,
  emptyActionsHash
) {}

export class Group extends SmartContract {
  // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
  @state(Field) merkleRoot = State<Field>();
  @state(PublicKey) admin = State<PublicKey>();
  reducer = Reducer({ actionType: PublicKey });
  // state ipfs hash?

  @method async init() {
    super.init();
    this.merkleRoot.set(initialCommitment);
    this.admin.set(this.sender);
  }
  // reducers to get list of all join addreses to create merkle
  //merkle will hold remaining balance for the user

  @method
  async joinGroup(
    organizerSig: Signature,
    participantAddr: PublicKey
    // path: MyMerkleWitness
    //new ipfs hash
  ) {
    // we fetch the on-chain merkleRoot
    let merkleRoot = this.merkleRoot.get();
    this.merkleRoot.requireEquals(merkleRoot);
    let admin = this.admin.get();
    this.admin.requireEquals(admin);

    let participantHash = Poseidon.hash(participantAddr.toFields());
    let addressHash = Poseidon.hash(this.address.toFields());
    let message = Poseidon.hash([addressHash, participantHash]);

    organizerSig.verify(admin, [message]).assertTrue();

    // we check that the account is in the committed Merkle Tree
    // path.calculateRoot(participantHash).assertEquals(merkleRoot);

    // take payment

    // we update the account and grant one point!
    // let newAccount = account.addMina(1);

    // we calculate the new Merkle Root, based on the account changes
    // let newRoot = path.calculateRoot(participantHash);
    // this.merkleRoot.set(newRoot);
    this.reducer.dispatch(participantAddr);
  }

  @method
  async assertContainsAddress(address: PublicKey) {
    // get actions and, in a witness block, wrap them in a Merkle list of lists

    // note: need to reverse here because `getActions()` returns the last pushed action last,
    // but MerkleList.from() wants it to be first to match the natural iteration order
    let actionss = this.reducer.getActions().reverse();

    // let actionsList = Provable.witness(PublicKey, () =>
    //   actions.map((as) => MerkleActions.from(as))
    // );

    let merkleActionss = Provable.witness(MerkleActionss.provable, () =>
      MerkleActionss.from(actionss.map((as) => MerkleActions.from(as)))
    );

    // prove that we know the correct action state
    this.account.actionState.requireEquals(merkleActionss.hash);

    // now our provable code to process the actions is very straight-forward
    // (note: if we're past the actual sizes, `.pop()` returns a dummy Action -- in this case, the "empty" public key which is not equal to any real address)
    let hasAddress = Bool(false);
    // let counter = new Field(0);

    for (let i = 0; i < MAX_UPDATES_WITH_ACTIONS; i++) {
      let merkleActions = merkleActionss.pop();

      for (let j = 0; j < MAX_ACTIONS_PER_UPDATE; j++) {
        let action = merkleActions.pop();
        hasAddress = hasAddress.or(action.equals(address));
      }
      // counter.add(1)
    }

    hasAddress.assertTrue();
  }
}
