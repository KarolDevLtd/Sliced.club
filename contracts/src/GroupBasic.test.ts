import { FungibleToken } from './token/FungibleToken';
import { GroupBasic, GroupSettings, Payments, Entry } from './GroupBasic';
import {
  Field,
  Mina,
  PrivateKey,
  VerificationKey,
  PublicKey,
  fetchAccount,
  AccountUpdate,
  TokenId,
  UInt32,
  UInt64,
  Bool,
} from 'o1js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain';
import { GroupUserStorage } from './GroupUserStorage';
import { Escrow } from './Escrow';

let proofsEnabled = false;
const fee = 1e8;

interface UserState {
  compensations: number;
  payments: number;
  bids: number;
  claimed: boolean;
  canClaim: boolean;
}

interface ContractsState {
  stablecoinBalance: number;
  actionHash: Field;
  actions: Entry[][];
}

class UserStateTransition {
  constructor(
    public userStateStart: UserState,
    public userStateEnd: UserState,
    public currentPayment: boolean,
    public amountCompensations: number,
    public amountBids: number
  ) {}

  fetchTotalPayments() {
    return this.currentPayment ? 1 : 0 + this.amountCompensations;
  }
}

class ContractStateTransition {
  constructor(
    public contractStateStart: ContractsState,
    public contractStateEnd: ContractsState,
    public usersStateTransitions: UserStateTransition,
    public submittedPayment: number
  ) {}
}

describe('GroupBasic', () => {
  let testAccounts: TestPublicKey[],
    deployer: TestPublicKey,
    admin: TestPublicKey,
    bryan: TestPublicKey,
    alexa: TestPublicKey,
    billy: TestPublicKey,
    charlie: TestPublicKey,
    jackie: TestPublicKey,
    timmy: TestPublicKey,
    jimmy: TestPublicKey,
    theodore: TestPublicKey,
    groupPrivateKey = PrivateKey.random(),
    groupAddress = groupPrivateKey.toPublicKey(),
    escrowPrivateKey = PrivateKey.random(),
    escrowAddress = escrowPrivateKey.toPublicKey(),
    tokenPrivateKey = PrivateKey.random(),
    tokenAddress = tokenPrivateKey.toPublicKey(),
    group: GroupBasic,
    escrow: Escrow,
    tokenApp: FungibleToken,
    derivedTokenId: Field,
    verificationKey: VerificationKey;

  let userStart: number, userEnd: number;

  let groupRounds = 8;
  let members = 8;
  let missable = 3;
  let basePayment = UInt32.from(1);
  let lotteryWinner: PublicKey;
  let roundMembers: Mina.TestPublicKey[] = [];
  let itemPrice = 3000;
  class User {
    totalPayments = 0;
    totalCompensations = 0;
    constructor(public key: TestPublicKey) {}
  }
  // Array of users
  let users: User[] = [];

  const GROUP_SETTINGS = new GroupSettings(
    new UInt32(members), // members
    new UInt32(itemPrice), // itemPrice
    new UInt32(groupRounds), // groupDuration
    tokenAddress,
    new UInt32(missable), // can be missed
    new UInt64(0)
  ); // 500 monthly

  const singlePayment = (itemPrice * 2) / members;

  const emptyKey = PublicKey.fromBase58(
    'B62qqaYPT5oVGCntFRfsownCzTBEP297BzLiBXgoq8bSSJB1pYZ53CN'
  );

  const paymentAmount = GROUP_SETTINGS.itemPrice
    .div(GROUP_SETTINGS.members)
    .mul(new UInt32(2));

  function createWinners(): number[] {
    let array: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }

  beforeAll(async () => {
    //we always need to compile vk2 for tokenStorage
    // Analsye methods
    // console.log('Methods analysed: \n', await GroupBasic.analyzeMethods());
    const { verificationKey: vk2 } = await GroupBasic.compile();
    verificationKey = vk2;
    if (proofsEnabled) {
      await FungibleToken.compile();
      console.log('compiled fungible token ');
      await Escrow.compile();
      console.log('compiled escrow ');
    }

    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    // users at indexes: 2 - 9
    userStart = 2;
    userEnd = 9;
    [
      deployer,
      admin,
      alexa,
      bryan,
      billy,
      charlie,
      jackie,
      timmy,
      jimmy,
      theodore,
    ] = testAccounts = Local.testAccounts;

    roundMembers = testAccounts.slice(2, 10);

    // Populate users with group members
    for (let i = 0; i < roundMembers.length; i++) {
      users.push(new User(roundMembers[i]));
    }

    // Create a subset of round members

    group = new GroupBasic(groupAddress);
    group = new GroupBasic(groupAddress);
    escrow = new Escrow(escrowAddress);
    tokenApp = new FungibleToken(tokenAddress);
    derivedTokenId = TokenId.derive(groupAddress);

    // let newAccount = TestPublicKey.random();
    // testAccounts.push(newAccount);
    await localDeploy();
  });

  function extract(ticks: Field, set = '') {
    let ticksBool = Payments.unpack(ticks);

    let total = 0;
    // Create a js array of bolls for logggign
    let boolArr = ticksBool.map((item) => {
      return item.toBoolean();
    });

    // console.log(`${set}; ${boolArr}`);

    for (let i = 0; i < ticksBool.length; i++) {
      if (ticksBool[i].toBoolean()) {
        total += 1;
      }
    }
    return total;
  }

  function fetchPaid(user: PublicKey, userName = '') {
    let ud = new GroupUserStorage(user, group.deriveTokenId());
    let payments: Field = ud.payments.get();
    return extract(payments, `Payments ${userName}`);
  }

  function fetchCompensation(user: PublicKey, userName = '') {
    let ud = new GroupUserStorage(user, group.deriveTokenId());
    let payments: Field = ud.compensations.get();
    return extract(payments, `Compensations ${userName}`);
  }

  // Need to reset bids somehow? TODO check
  function fetchUserState(user: PublicKey): Promise<UserState> {
    let ud = new GroupUserStorage(user, group.deriveTokenId());
    return Promise.resolve({
      compensations: fetchCompensation(user),
      payments: fetchPaid(user),
      bids: parseInt(ud.bidPayment.get().toString()),
      claimed: ud.claimed.get().toBoolean(),
      canClaim: ud.canClaim.get().toBoolean(),
    });
  }

  async function fetchContractsState(): Promise<ContractsState> {
    return {
      stablecoinBalance: parseInt(
        (await tokenApp.getBalanceOf(escrowAddress)).toString()
      ),
      actionHash: group.latestActionState.get(),
      actions: await group.reducer.fetchActions(),
    };
  }

  // Assert valid user state transition
  function assertUserStateTransition(details: UserStateTransition) {
    // Assert payments are incremented
    expect(details.userStateEnd.payments).toEqual(
      details.userStateStart.payments + (details.currentPayment ? 1 : 0)
    );
    // Assert compensations are or are not incremented
    expect(details.userStateEnd.compensations).toEqual(
      details.userStateStart.compensations + details.amountCompensations
    );
    // Assert bids are or are not incremented
    expect(details.userStateEnd.bids).toEqual(
      details.userStateStart.bids + details.amountBids
    );
  }

  function assertContractsStateTransitionPayment(
    details: ContractStateTransition,
    round: number
  ) {
    // By paying user emits an action
    expect(details.contractStateStart.actions.length + 1).toEqual(
      details.contractStateEnd.actions.length
    );

    // Escrow contract must increase by the amount paid by this user
    expect(details.contractStateEnd.stablecoinBalance).toEqual(
      details.contractStateStart.stablecoinBalance +
        details.submittedPayment * singlePayment
    );

    // No change in the action hash after payment
    expect(details.contractStateEnd.actionHash).toEqual(
      details.contractStateStart.actionHash
    );

    // Emmited action needs to have the correct round
    expect(
      parseInt(
        details.contractStateEnd.actions[
          details.contractStateEnd.actions.length - 1
        ][0].paymentRound.toString()
      )
    ).toEqual(round);
  }

  async function setPaymentRound(roundIndex: UInt64) {
    const txn = await Mina.transaction(admin, async () => {
      await group.roundUpdate(roundIndex);
    });
    await txn.prove();
    await txn.sign([admin.key]).send();
  }

  async function getResults(winnerIdx: number) {
    const txn = await Mina.transaction(admin, async () => {
      await group.getResults(GROUP_SETTINGS, admin.key, new Field(winnerIdx));
    });
    await txn.prove();
    await txn.sign([admin.key]).send();
  }

  async function incrementRound(roundIndex: UInt64): Promise<UInt64> {
    const paymentRound = group.paymentRound.get();
    let currentRound = paymentRound.add(roundIndex);
    await setPaymentRound(currentRound);
    return currentRound;
  }

  async function localDeploy() {
    const deployTokenTx = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await tokenApp.deploy({
        owner: admin,
        supply: UInt64.from(10_000_000_000_000),
        symbol: 'mUSD',
        src: 'source code link',
      });
    });
    await deployTokenTx.prove();
    await (
      await deployTokenTx.sign([deployer.key, tokenPrivateKey]).send()
    ).wait();

    const deployGroupTx = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer, 3);
      await group.deploy({
        admin: admin,
        groupSettings: GROUP_SETTINGS,
        escrow: escrowAddress,
      });
      await escrow.deploy({ withdrawauth: groupAddress });
      let groupToken = AccountUpdate.create(
        groupAddress,
        tokenApp.deriveTokenId()
      );
      // AccountUpdate.create(escrowAddress, tokenApp.tokenId);
      await tokenApp.approveAccountUpdates([groupToken, escrow.self]);
    });
    await deployGroupTx.prove();
    await (
      await deployGroupTx
        .sign([deployer.key, groupPrivateKey, escrowPrivateKey])
        .send()
    ).wait();

    // Assert group deploy field equal to hash of the field
    expect(GROUP_SETTINGS.hash()).toEqual(group.groupSettingsHash.get());
  }

  // Submit paymen function
  async function payRound(payer: User, bids: number, payments: number) {
    const txn = await Mina.transaction(payer.key, async () => {
      await group.roundPayment(
        GROUP_SETTINGS,
        UInt64.from(bids),
        new UInt32(payments)
      );
    });

    await txn.prove();
    await txn.sign([payer.key.key]).send();
  }

  async function claim(claimer: User) {
    const txn = await Mina.transaction(claimer.key, async () => {
      await group.userClaim(GROUP_SETTINGS);
    });
    await txn.prove();
    await txn.sign([claimer.key.key]).send();
  }

  it('Mints and distributes tokens ', async () => {
    const mintAmount = new UInt64(1_000_000_000);
    const initialBalanceAdmin = (await tokenApp.getBalanceOf(admin)).toBigInt();

    const mintTx = await Mina.transaction(
      {
        sender: admin,
        fee,
      },
      async () => {
        AccountUpdate.fundNewAccount(admin);
        await tokenApp.mint(admin, mintAmount);
      }
    );
    await mintTx.prove();
    mintTx.sign([admin.key]);
    await mintTx.send().then((v) => v.wait());
    expect((await tokenApp.getBalanceOf(admin)).toBigInt()).toEqual(
      initialBalanceAdmin + mintAmount.toBigInt()
    );

    const userAmount = new UInt64(15000);

    // All user get fake stable
    // TODO batch this
    // for (let i = userStart; i <= userEnd; i + 2) {
    for (let i = userStart; i <= userEnd; i++) {
      console.log(`Minting for user[${i}]: `, testAccounts[i].toBase58());
      // console.log(
      //   `Minting for user[${i + 2}]: `,
      //   testAccounts[i + 2].toBase58()
      // );
      const transferTx = await Mina.transaction(
        {
          sender: admin,
          fee,
        },
        async () => {
          AccountUpdate.fundNewAccount(admin);
          await tokenApp.transfer(admin, testAccounts[i], userAmount);
          // await tokenApp.transfer(admin, testAccounts[i + 1], userAmount);
        }
      );

      await transferTx.prove();
      transferTx.sign([admin.key]);
      await transferTx.send().then((v) => v.wait());
      expect((await tokenApp.getBalanceOf(testAccounts[i])).toBigInt()).toEqual(
        userAmount.toBigInt()
      );
    }

    console.log('Created all of the token accounts');
  });

  it('Adds a single user to the group', async () => {
    const txn1 = await Mina.transaction(alexa, async () => {
      AccountUpdate.fundNewAccount(alexa);
      await group.addUserToGroup(
        GROUP_SETTINGS,
        alexa.key.toPublicKey(),
        verificationKey
      );
    });
    await txn1.prove();
    await txn1.sign([alexa.key]).send();
    await fetchAccount({
      publicKey: alexa.key.toPublicKey(),
      tokenId: derivedTokenId,
    });
    let isParticipant = new GroupUserStorage(
      alexa.key.toPublicKey(),
      derivedTokenId
    ).isParticipant.get();
    expect(isParticipant).toEqual(Bool(true));

    // Log this users address
    console.log('Alexa address: ', alexa.key.toPublicKey().toBase58());

    // Derive alexa token address
    let alexaTokenAddress = new GroupUserStorage(
      alexa.key.toPublicKey(),
      derivedTokenId
    );

    console.log('Alexa token address: ', alexaTokenAddress.address.toBase58());
  });

  it('Adds remaining users to the group', async () => {
    // console.log('Adding remaining users to the group', userStart, userEnd);
    for (let i = userStart + 1; i <= userEnd; i++) {
      const usersStart = parseInt(group.members.get().toString());
      const txn1 = await Mina.transaction(testAccounts[i], async () => {
        AccountUpdate.fundNewAccount(testAccounts[i]);
        await group.addUserToGroup(
          GROUP_SETTINGS,
          testAccounts[i].key.toPublicKey(),
          verificationKey
        );
      });
      await txn1.prove();
      await txn1.sign([testAccounts[i].key]).send();
      // console.log(txn1.toPretty());
      await fetchAccount({
        publicKey: testAccounts[i].key.toPublicKey(),
        tokenId: derivedTokenId,
      });
      let isParticipant = new GroupUserStorage(
        testAccounts[i].key.toPublicKey(),
        derivedTokenId
      ).isParticipant.get();
      expect(isParticipant).toEqual(Bool(true));
      const usersEnd = parseInt(group.members.get().toString());
      // Assert one more user added in contract
      expect(usersEnd).toEqual(usersStart + 1);
    }
  });

  it('Create empty account for escrow to recive tokens and ', async () => {
    let tx3 = await Mina.transaction(alexa, async () => {
      AccountUpdate.fundNewAccount(alexa);
      AccountUpdate.create(escrowAddress, tokenApp.tokenId);
      await tokenApp.transfer(alexa, escrowAddress, UInt64.from(50));
    })
      .sign([alexa.key])
      .prove()
      .send();
  });

  // Need to test what happens when none members are ellgible

  it('Run where each member pays each month once', async () => {
    // Loop over number of rounds
    let winners: number[] = createWinners();
    let totalPayments = 0;

    for (let r = 0; r < groupRounds; r++) {
      console.log(`\nRound: ${r}`);

      // Fetch the action hash
      let actionHashStart = group.latestActionState.get();

      for (let m = 0; m < roundMembers.length; m++) {
        // Fetch end contracts state
        let contractStateStart = await fetchContractsState();

        // Get user state at the start
        let userStateStart = await fetchUserState(roundMembers[m]);

        console.log(` Paying as member ${m}`);

        let paymentAmounts = 1;
        let compensationAmounts = 0;
        let submittingTx = false;
        if (paymentAmounts > 0) {
          submittingTx = true;
          totalPayments += 1;
          totalPayments += compensationAmounts;
        }
        await payRound(users[m], compensationAmounts, paymentAmounts);

        // Get user state at the end
        let userStateEnd = await fetchUserState(roundMembers[m]);

        let ust = new UserStateTransition(
          userStateStart,
          userStateEnd,
          submittingTx,
          0,
          0
        );

        // Check for correct state transitions
        assertUserStateTransition(ust);

        // Fetch end contracts state
        let contractStateEnd = await fetchContractsState();

        assertContractsStateTransitionPayment(
          {
            contractStateStart,
            contractStateEnd,
            usersStateTransitions: ust,
            submittedPayment: paymentAmounts,
          },
          r
        );
      }

      // Pick a number in the range 0-groupSize
      let winnerNumber: number = winners.pop()!;

      console.log(`Member indexed ${winnerNumber} wins round ${r}`);

      // Advance round as the organiser
      await getResults(winnerNumber);

      // Assert hash swaped after calling results
      let actionHashEnd = group.latestActionState.get();
      expect(actionHashStart).not.toEqual(actionHashEnd);

      let winner = users[winnerNumber];
      let winnerState = await fetchUserState(winner.key);

      // Assert winning user is marked as winner in the token account
      expect(winnerState.canClaim).toEqual(true);

      // Claims as the winner
      await claim(winner);

      // Assert user is marked as claimed
      expect((await fetchUserState(winner.key)).claimed).toEqual(true);

      // Need to add tests for auction winner paying
      console.log(`End of round ${r}`);
    }

    //   console.log('run a single payment');
  });
});
