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
} from 'o1js';

// class MyMerkleWitness extends MerkleWitness(96) {}
// constants for our static-sized provable code
const MAX_UPDATES_WITH_ACTIONS = 100;
const MAX_ACTIONS_PER_UPDATE = 2;
// we need the initiate tree root in order to tell the contract about our off-chain storage
let initialCommitment: Field = Field(0);

const { Actions } = AccountUpdate;
class Auction extends Struct({
  publicKey: PublicKey,
  bid: UInt32,
}) {
  constructor(publicKey: PublicKey, bid: UInt32) {
    super({ publicKey, bid });
  }
  hash(): Field {
    return Poseidon.hash(Auction.toFields(this));
  }
  toFields(): Field[] {
    return Auction.toFields(this);
  }
  static empty<T extends new (...args: any) => any>(): InstanceType<T> {
    return new Auction(PublicKey.empty(), UInt32.zero) as any;
  }

  static from(publicKey: PublicKey, bid: UInt32) {
    return new Auction(publicKey, bid);
  }
}

// the actions within one account update are a Merkle list with a custom hash
// const emptyHash = Actions.empty().hash;
const emptyAuction = Auction.empty<typeof Auction>();
const emptyHash = emptyAuction.hash();
const nextHash = (hash: Field, value: { publicKey: PublicKey; bid: UInt32 }) =>
  Actions.pushEvent(
    {
      hash,
      data: [value.publicKey.toFields(), value.bid.toFields()],
    },
    emptyAuction.toFields()
  ).hash;
// Actions.pushEvent({ hash, data: [] }, action.toFields()).hash;
class AuctionList extends MerkleList.create(Auction, nextHash, emptyHash) {}
// class AuctionList extends MerkleList.create(Auction) {}

// let myList = AuctionList.empty();
// class MyList extends MerkleList.create(Auction, (hash, x) =>
//   Poseidon.hashWithPrefix('custom', [hash, x])
// ) {}

// the "action state" / actions from many account updates is a Merkle list
// of the above Merkle list, with another custom hash
// let emptyActionsHash = Actions.emptyActionState();
// const nextActionsHash = (hash: Field, actions: AuctionList) =>
//   Actions.updateSequenceState(hash, actions.hash);

// class MerkleActionss extends MerkleList.create(
//   MerkleActions.provable,
//   nextActionsHash,
//   emptyActionsHash
// ) {}

const NullifierTree = new MerkleMap();

export class Group extends SmartContract {
  // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
  @state(Field) merkleRoot = State<Field>();
  @state(Field) nullifierRoot = State<Field>();
  @state(PublicKey) admin = State<PublicKey>();
  @state(Field) paymentRound = State<Field>();
  reducer = Reducer({ actionType: Auction });
  // state ipfs hash?

  @method async init() {
    super.init();
    this.merkleRoot.set(initialCommitment);
    this.admin.set(this.sender.getAndRequireSignature());
  }

  @method async makePaymentRound(nullifier: Nullifier) {
    let nullifierRoot = this.nullifierRoot.getAndRequireEquals();
    let nullifierMessage = this.paymentRound.getAndRequireEquals();

    nullifier.verify([nullifierMessage]);

    // let nullifierWitness = Circuit.witness(MerkleMapWitness, () => // todo as broken on 0.18.0
    //   NullifierTree.getWitness(nullifier.key())
    // );

    // // we compute the current root and make sure the entry is set to 0 (= unused)
    // nullifier.assertUnused(nullifierWitness, nullifierRoot);

    // // we set the nullifier to 1 (= used) and calculate the new root
    // let newRoot = nullifier.setUsed(nullifierWitness);

    // // we update the on-chain root
    // this.nullifierRoot.set(newRoot);
    // nullifier.verify([nullifierMessage]).assertTrue();
    // nullifier.assertUnused(nullifierRoot).assertTrue();
    // let newRoot = nullifier.setUsed(nullifierRoot);
    // this.nullifierRoot.set(newRoot);
    // this.paymentRound.set(nullifierMessage.add(1));
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
    this.reducer.dispatch(Auction.from(participantAddr, UInt32.from(2)));
  }

  @method
  async auction(address: PublicKey) {
    // get actions and, in a witness block, wrap them in a Merkle list of lists

    // note: need to reverse here because `getActions()` returns the last pushed action last,
    // but MerkleList.from() wants it to be first to match the natural iteration order
    let actionss = this.reducer.getActions(); //.reverse();

    // let actionsList = Provable.witness(PublicKey, () =>
    //   actions.map((as) => MerkleActions.from(as))
    // );

    // let merkleActionss = Provable.witness(MerkleActionss.provable, () =>
    //   MerkleActionss.from(actionss.map((as) => MerkleActions.from(as)))
    // );

    // let merkleActionss = Provable.witness(AuctionList.provable, () =>
    //   actionss.map((actionArr) =>
    //     AuctionList.from(
    //       actionArr.map((action) => Auction.from(action.publicKey, action.bid))
    //     )
    //   )
    // );
    // let merkleActionss = Provable.witness(AuctionList.provable, () =>
    //   AuctionList.from(
    //     actionss.map((as) => as.map((a) => Auction.from(a.publicKey, a.bid)))
    //   )
    // );
    // let merkleActionss = AuctionList
    //   .from

    // actionss.map((as) => )
    // ();
    // prove that we know the correct action state
    // this.account.actionState.requireEquals(merkleActionss.hash);

    // now our provable code to process the actions is very straight-forward
    // (note: if we're past the actual sizes, `.pop()` returns a dummy Action -- in this case, the "empty" public key which is not equal to any real address)
    let winner = PublicKey.empty();
    let counter = new UInt32(0);

    for (let i = 0; i < MAX_UPDATES_WITH_ACTIONS; i++) {
      // let merkleActions = merkleActionss.pop();
      // for (let j = 0; j < MAX_ACTIONS_PER_UPDATE; j++) {
      // let action = merkleActions.pop();
      // hasAddress = hasAddress.or(action.equals(address));
      // counter = Provable.if(
      //   counter.lessThan(merkleActions.bid),
      //   counter,
      //   merkleActions.bid
      // );
      // winner = Provable.if(
      //   counter.equals(merkleActions.bid),
      //   merkleActions.publicKey,
      //   winner
      // );
      // }
      // counter.add(1)
    }

    // winner.assertTrue();
  }
}
