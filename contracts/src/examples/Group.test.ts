// import {
//   SmartContract,
//   Poseidon,
//   Field,
//   State,
//   state,
//   PublicKey,
//   Mina,
//   method,
//   UInt32,
//   PrivateKey,
//   AccountUpdate,
//   MerkleTree,
//   MerkleWitness,
//   Struct,
// } from 'o1js';

// let initialCommitment: Field = Field(0);
// type Names = 'Bob' | 'Alice' | 'Charlie' | 'Olivia';

// let Local = Mina.LocalBlockchain({ proofsEnabled: doProofs });
// Mina.setActiveInstance(Local);
// let initialBalance = 10_000_000_000;

// let feePayerKey = Local.testAccounts[0].privateKey;
// let feePayer = Local.testAccounts[0].publicKey;

// // the zkapp account
// let zkappKey = PrivateKey.random();
// let zkappAddress = zkappKey.toPublicKey();

// // this map serves as our off-chain in-memory storage
// let Accounts: Map<string, Account> = new Map<Names, Account>(
//   ['Bob', 'Alice', 'Charlie', 'Olivia'].map((name: string, index: number) => {
//     return [
//       name as Names,
//       new Account({
//         publicKey: Local.testAccounts[index].publicKey,
//         points: UInt32.from(0),
//       }),
//     ];
//   })
// );

// // we now need "wrap" the Merkle tree around our off-chain storage
// // we initialize a new Merkle Tree with height 8
// const Tree = new MerkleTree(300);

// Tree.setLeaf(0n, Accounts.get('Bob')!.hash());
// Tree.setLeaf(1n, Accounts.get('Alice')!.hash());
// Tree.setLeaf(2n, Accounts.get('Charlie')!.hash());
// Tree.setLeaf(3n, Accounts.get('Olivia')!.hash());

// // now that we got our accounts set up, we need the commitment to deploy our contract!
// initialCommitment = Tree.getRoot();

// let leaderboardZkApp = new Leaderboard(zkappAddress);
// console.log('Deploying leaderboard..');
// if (doProofs) {
//   await Leaderboard.compile();
// }
// let tx = await Mina.transaction(feePayer, async () => {
//   AccountUpdate.fundNewAccount(feePayer).send({
//     to: zkappAddress,
//     amount: initialBalance,
//   });
//   await leaderboardZkApp.deploy();
// });
// await tx.prove();
// await tx.sign([feePayerKey, zkappKey]).send();

// console.log('Initial points: ' + Accounts.get('Bob')?.points);

// console.log('Making guess..');
// await makeGuess('Bob', 0n, 22);

// console.log('Final points: ' + Accounts.get('Bob')?.points);

// async function makeGuess(name: Names, index: bigint, guess: number) {
//   let account = Accounts.get(name)!;
//   let w = Tree.getWitness(index);
//   let witness = new MyMerkleWitness(w);

//   let tx = await Mina.transaction(feePayer, async () => {
//     await leaderboardZkApp.guessPreimage(Field(guess), account, witness);
//   });
//   await tx.prove();
//   await tx.sign([feePayerKey, zkappKey]).send();

//   // if the transaction was successful, we can update our off-chain storage as well
//   account.points = account.points.add(1);
//   Tree.setLeaf(index, account.hash());
//   leaderboardZkApp.commitment.get().assertEquals(Tree.getRoot());
// }
