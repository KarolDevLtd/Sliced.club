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

let proofsEnabled = true;
const fee = 1e8;

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

  let groupRounds = 6;
  let missable = 3;
  let basePayment = UInt32.from(1);
  let lotteryWinner: PublicKey;

  const GROUP_SETTINGS = new GroupSettings(
    new UInt32(8), // members
    new UInt32(3000), // itemPrice
    new UInt32(groupRounds), // groupDuration
    tokenAddress,
    new UInt32(missable), // groupDuration
    new UInt64(0)
  ); // 500 monthly

  const emptyKey = PublicKey.fromBase58(
    'B62qqaYPT5oVGCntFRfsownCzTBEP297BzLiBXgoq8bSSJB1pYZ53CN'
  );

  const paymentAmount = GROUP_SETTINGS.itemPrice
    .div(GROUP_SETTINGS.members)
    .mul(new UInt32(2));

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

    group = new GroupBasic(groupAddress);
    group = new GroupBasic(groupAddress);
    escrow = new Escrow(escrowAddress);
    tokenApp = new FungibleToken(tokenAddress);

    derivedTokenId = TokenId.derive(groupAddress);

    console.log(`
    deployer ${deployer.toBase58()}
    admin ${admin.toBase58()}
    alexa ${alexa.toBase58()}
    billy ${billy.toBase58()}
    charlie ${charlie.toBase58()}
    jackie ${jackie.toBase58()}
    timmy ${timmy.toBase58()}
    jimmy ${jimmy.toBase58()}
    theodore ${theodore.toBase58()}
    bryan ${bryan.toBase58()}
  


    token ${tokenAddress.toBase58()}
    groupBasic ${groupAddress.toBase58()}
  `);
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
  async function setPaymentRound(roundIndex: UInt64) {
    const txn = await Mina.transaction(admin, async () => {
      await group.roundUpdate(roundIndex);
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

    // const escrowDeployTx = await Mina.transaction(deployer, async () => {
    //   AccountUpdate.fundNewAccount(deployer);
    //   await escrow.deploy({ withdrawauth: admin });
    // });
    // await escrowDeployTx.prove();
    // await (
    //   await escrowDeployTx.sign([deployer.key, escrowPrivateKey]).send()
    // ).wait();

    // Assert group deploy field equal to hash of the field
    expect(GROUP_SETTINGS.hash()).toEqual(group.groupSettingsHash.get());
  }

  // Works by itself
  it('Escrow transfer', async () => {
    // let tx0 = await Mina.transaction(deployer, async () => {
    //   AccountUpdate.fundNewAccount(deployer, 1);
    //   let groupToken = AccountUpdate.create(
    //     groupAddress,
    //     tokenApp.deriveTokenId()
    //   );
    //   await tokenApp.approveAccountUpdates([groupToken, escrow.self]);
    // });
    // await tx0.sign([deployer.key, escrowPrivateKey]).prove();
    // await tx0.send();

    console.log('hello timmy');
  });

  // it('Generates and deploys the `GroupBasic` smart contract', async () => {
  //   // const groupToken = group.tokenAddress.get();
  //   // expect(groupToken).toEqual(tokenAddress);
  //   const groupAdmin = group.admin.get();
  //   // console.log(group.paymentRound.get().toBigInt());
  //   // console.log(groupAdmin.toBase58());
  //   expect(groupAdmin.toBase58()).toEqual(admin.toBase58());
  // });

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

    const userAmount = new UInt64(5000);

    // All user get fake stable
    for (let i = userStart; i <= userEnd; i++) {
      console.log(`Minting for user[${i}]: `, testAccounts[i].toBase58());
      const transferTx = await Mina.transaction(
        {
          sender: admin,
          fee,
        },
        async () => {
          AccountUpdate.fundNewAccount(admin);
          await tokenApp.transfer(admin, testAccounts[i], userAmount);
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

    // Initially fund smart contract for stablecoin
    // console.log('Trying to fund group contract with stable');
    // Account already created
    // const initTokenStable = await Mina.transaction(
    //   {
    //     sender: admin,
    //     fee,
    //   },
    //   async () => {
    //     // AccountUpdate.fundNewAccount(admin);
    //     await tokenApp.transfer(admin, groupAddress, new UInt64(1));
    //   }
    // );

    // await initTokenStable.prove();
    // initTokenStable.sign([admin.key]);
    // await initTokenStable.send().then((v) => v.wait());

    // console.log('Funded smart contract with stablecount');
  });

  // // it('Sets group contract as the withdraw auth of the escrow ', async () => {});

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

  // it('Fails without all members being added', async () => {
  //   await expect(
  //     Mina.transaction(alexa, async () => {
  //       await group.roundPayment(GROUP_SETTINGS, UInt64.from(0), UInt32.one);
  //     })
  //   ).rejects.toThrow();
  // });

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

  // xit('Fails to make a payment if user is not added to the group', async () => {
  //   await expect(
  //     Mina.transaction(deployer, async () => {
  //       AccountUpdate.fundNewAccount(deployer);
  //       await group.roundPayment(GROUP_SETTINGS, UInt64.from(0), UInt32.zero);
  //     })
  //   ).rejects.toThrow();
  // });

  // xit('Fails add a new user to the full group', async () => {
  //   await expect(
  //     Mina.transaction(deployer, async () => {
  //       AccountUpdate.fundNewAccount(deployer);
  //       await group.addUserToGroup(
  //         GROUP_SETTINGS,
  //         deployer.key.toPublicKey(),
  //         verificationKey
  //       );
  //     })
  //   ).rejects.toThrow();
  // });
  it('Direct payment', async () => {
    let tx3 = await Mina.transaction(alexa, async () => {
      AccountUpdate.fundNewAccount(alexa);
      AccountUpdate.create(escrowAddress, tokenApp.tokenId);
      await tokenApp.transfer(alexa, escrowAddress, UInt64.from(50));
    })
      .sign([alexa.key])
      .prove()
      .send();
  });

  it('Correctly makes a test payment to escrow', async () => {
    // Fetch balance of the scrow at the start
    const initialBalanceEscrow = (
      await tokenApp.getBalanceOf(escrowAddress)
    ).toBigInt();

    console.log('Initial balance escrow: ', initialBalanceEscrow);

    const txn = await Mina.transaction(alexa, async () => {
      // await tokenApp.approveAccountUpdate(escrow.self);
      await group.testPayment(GROUP_SETTINGS);
    });
    await txn.prove();
    await txn.sign([alexa.key]).send();

    const endBalanceEscrow = (
      await tokenApp.getBalanceOf(escrowAddress)
    ).toBigInt();

    console.log('End balance escrow: ', endBalanceEscrow);
  });

  it('Correctly makes a payment, without bids', async () => {
    // Start payment count
    let totalPaymentsStart = fetchPaid(alexa, 'Alexa start');
    let totalCompStart = fetchCompensation(alexa, 'Alexa start');

    // Check that it has not been ticked off
    const paymentsBoolStart: Bool[] = Payments.unpack(
      new GroupUserStorage(
        alexa.key.toPublicKey(),
        derivedTokenId
      ).payments.get()
    );
    expect(
      paymentsBoolStart[parseInt(group.paymentRound.get().toString())]
    ).toEqual(Bool(false));
    const initialBalanceAlexa = (await tokenApp.getBalanceOf(alexa)).toBigInt();
    const initialBalanceEscrow = (
      await tokenApp.getBalanceOf(escrowAddress)
    ).toBigInt();
    const txn = await Mina.transaction(alexa, async () => {
      // AccountUpdate.fundNewAccount(alexa);
      // await tokenApp.approveAccountUpdate(escrow.self);
      await group.roundPayment(GROUP_SETTINGS, UInt64.from(0), basePayment);
    });

    await txn.prove();
    await txn.sign([alexa.key]).send();
    expect((await tokenApp.getBalanceOf(alexa)).toBigInt()).toEqual(
      initialBalanceAlexa - paymentAmount.toBigint()
    );
    expect((await tokenApp.getBalanceOf(escrowAddress)).toBigInt()).toEqual(
      initialBalanceEscrow + paymentAmount.toBigint()
    );

    // Payment has been marked
    let totalPaymentsEnd = fetchPaid(alexa, 'Alexa end');
    expect(totalPaymentsEnd).toEqual(totalPaymentsStart + 1);

    // No comp marked
    let totalCompEnd = fetchCompensation(alexa, 'Alexa end');
    expect(totalCompEnd).toEqual(totalCompStart);

    // User did  pay current month, hence ellgible for the lottery
    let actions: Entry[][] = await group.reducer.fetchActions();
    let latestAction: Entry = actions[actions.length - 1][1];
    expect(latestAction.lotteryElligible.toBoolean()).toEqual(true);
  });

  it('1st user correctly joins the auction', async () => {
    const billyBid = UInt64.from(2);
    const initialBalanceBilly = (await tokenApp.getBalanceOf(billy)).toBigInt();
    const initialBalanceEscrow = (
      await tokenApp.getBalanceOf(escrowAddress)
    ).toBigInt();
    const txn = await Mina.transaction(billy, async () => {
      // AccountUpdate.fundNewAccount(billy);
      await group.roundPayment(GROUP_SETTINGS, billyBid, basePayment);
    });
    await txn.prove();

    await txn.sign([billy.key]).send();
    expect((await tokenApp.getBalanceOf(billy)).toBigInt()).toEqual(
      initialBalanceBilly - paymentAmount.mul(2).toBigint()
    );
    expect((await tokenApp.getBalanceOf(escrowAddress)).toBigInt()).toEqual(
      initialBalanceEscrow + paymentAmount.mul(2).toBigint()
    );
  });

  it('2nd user (higher bidder) correctly joins the auction', async () => {
    const charlieBid = UInt64.from(3);
    const initialBalanceCharlie = (
      await tokenApp.getBalanceOf(charlie)
    ).toBigInt();
    const initialBalanceEscrow = (
      await tokenApp.getBalanceOf(escrowAddress)
    ).toBigInt();
    const txn = await Mina.transaction(charlie, async () => {
      // AccountUpdate.fundNewAccount(charlie);
      await group.roundPayment(GROUP_SETTINGS, charlieBid, basePayment);
    });

    await txn.prove();
    await txn.sign([charlie.key]).send();
    expect((await tokenApp.getBalanceOf(charlie)).toBigInt()).toEqual(
      initialBalanceCharlie - paymentAmount.mul(2).toBigint()
    );
    expect((await tokenApp.getBalanceOf(escrowAddress)).toBigInt()).toEqual(
      initialBalanceEscrow + paymentAmount.mul(2).toBigint()
    );

    // User did  pay current month, hence ellgible for the lottery
    let actions: Entry[][] = await group.reducer.fetchActions();
    let latestAction: Entry = actions[actions.length - 1][1];
    expect(latestAction.lotteryElligible.toBoolean()).toEqual(true);
  });

  it('Correctly chooses the winners', async () => {
    const txn = await Mina.transaction(admin, async () => {
      // AccountUpdate.fundNewAccount(admin);
      // Keeping it at 10 makes both winners the same
      await group.getResults(GROUP_SETTINGS, admin.key, Field.from(10));
    });
    await txn.prove();
    await txn.sign([admin.key]).send();

    //
    let events = await group.fetchEvents();
    for (const event of await group.fetchEvents()) {
      console.log(event.type, JSON.stringify(event.event.data));
    }

    let lotteryWinnerKey = JSON.stringify(events[1].event.data).slice(1, -1);
    let auctionWinnerKey = JSON.stringify(events[0].event.data).slice(1, -1);

    // Need to assert that the emmited winner is not base publickey
    expect(lotteryWinnerKey).not.toEqual(PublicKey.empty().toBase58());

    console.log('Lottery winner key: ', lotteryWinnerKey);
    console.log('Auction Winner key: ', auctionWinnerKey);
    console.log('Empty          key', PublicKey.empty().toBase58());

    // Need to assert that the emmited winner is not base publickey
    // as there is at least one bidder
    expect(auctionWinnerKey).not.toEqual(PublicKey.empty().toBase58());

    // Assert lottery and auction winners are different accounts
    expect(lotteryWinnerKey).not.toEqual(auctionWinnerKey);
    lotteryWinner = PublicKey.fromBase58(lotteryWinnerKey);

    const newPaymentRound = group.paymentRound.get();
    // expect(newPaymentRound.toBigInt()).toEqual(paymentRound.add(1).toBigInt());

    // Fetch actions
    let actions: Entry[][] = await group.reducer.fetchActions();
    console.log('Actions sizze: ', actions.length);
  });

  it('Claim as auction winner', async () => {
    let udStart = new GroupUserStorage(billy, group.deriveTokenId());
    let claimed = udStart.claimed.get().toBoolean();

    // Assert it is unclaimed at the start
    expect(claimed).toEqual(false);

    const txn = await Mina.transaction(billy, async () => {
      await group.userClaim();
    });

    await txn.prove();
    await txn.sign([billy.key]).send();

    let udEnd = new GroupUserStorage(billy, group.deriveTokenId());
    claimed = udEnd.claimed.get().toBoolean();

    // Assert it is claimed at the end
    expect(claimed).toEqual(true);
  });

  it('Claim as lottery winner', async () => {
    // Fetch lottery winner from test accounts based on stored winner account
    let lotteryWinnerAccount = testAccounts.find(
      (account) =>
        account.key.toPublicKey().toBase58() === lotteryWinner.toBase58()
    );

    let udStart = new GroupUserStorage(
      lotteryWinnerAccount!,
      group.deriveTokenId()
    );
    let claimed = udStart.claimed.get().toBoolean();

    // Assert it is unclaimed at the start
    expect(claimed).toEqual(false);

    const txn = await Mina.transaction(lotteryWinnerAccount, async () => {
      await group.userClaim();
    });

    await txn.prove();
    await txn.sign([lotteryWinnerAccount!.key]).send();

    let udEnd = new GroupUserStorage(
      lotteryWinnerAccount!,
      group.deriveTokenId()
    );
    claimed = udEnd.claimed.get().toBoolean();

    // Assert it is claimed at the end
    expect(claimed).toEqual(true);
  });

  it("Admin can't withdraw arbitrary number", async () => {
    await expect(
      Mina.transaction(admin, async () => {
        await group.organiserWithdraw(GROUP_SETTINGS, UInt32.from(777));
      })
    ).rejects.toThrow();
  });

  it('Admin withdraws', async () => {
    // Log contract token balance at the start
    const initialBalanceAdmin = (
      await tokenApp.getBalanceOf(group.admin.get())
    ).toBigInt();
    const initialBalanceContract = (
      await tokenApp.getBalanceOf(group.address)
    ).toBigInt();
    console.log(
      'Initial balance contract: ',
      initialBalanceContract,
      '\n',
      'Initial balance admin: ',
      initialBalanceAdmin
    );

    const txn = await Mina.transaction(admin, async () => {
      await tokenApp.approveAccountUpdate(escrow.self);
      await group.organiserWithdraw(
        GROUP_SETTINGS,
        UInt32.from(GROUP_SETTINGS.itemPrice.toBigint())
      );
      // await tokenApp.approveAccountUpdate(group.self);
    });
    await txn.prove();
    await txn.sign([admin.key]).send();
    console.log('Withdrawn', txn.toPretty());

    const endlBalanceAdmin = (
      await tokenApp.getBalanceOf(group.admin.get())
    ).toBigInt();

    const endBalanceContract = (
      await tokenApp.getBalanceOf(group.address)
    ).toBigInt();
    console.log(
      'End balance contract: ',
      endBalanceContract,
      '\n',
      'End balance admin: ',
      endlBalanceAdmin
    );

    // Assertion for difference being taken away
    expect(parseInt(endlBalanceAdmin.toString())).toEqual(
      parseInt(initialBalanceAdmin.toString()) + 3000
    );
    expect(parseInt(endBalanceContract.toString())).toEqual(
      parseInt(initialBalanceContract.toString()) - 3000
    );
  });

  it('Compensation tests one missed payment, but no current', async () => {
    console.log('Round at the start: ', group.paymentRound.get().toString());

    // Round already advanced in the winner
    let currentRoundStart = group.paymentRound.get();
    // Subtract depending on whether that tests runs or not
    let currentRound = await incrementRound(new UInt64(1));
    console.log(
      'Current round after increment: ',
      currentRound.toBigInt().toString()
    );

    console.log('Round at the end: ', group.paymentRound.get().toString());

    // TODO: payeSehment needs to fail until compensation is done
    // Start payment count
    let totalPaymentsStart = fetchPaid(alexa, 'Alexa start');
    let totalCompStart = fetchCompensation(alexa, 'Alexa start');

    // Compensate for missed payment, don't pay current payment
    const txn2 = await Mina.transaction(alexa, async () => {
      await group.roundPayment(GROUP_SETTINGS, UInt64.zero, UInt32.one);
    });

    await txn2.prove();
    await txn2.sign([alexa.key]).send();

    // Start payment count
    let totalPaymentsEnd = fetchPaid(alexa, 'Alexa end');
    let totalCompEnd = fetchCompensation(alexa, 'Alexa end');

    expect(totalPaymentsEnd).toEqual(totalPaymentsStart);
    expect(totalCompEnd).toEqual(totalCompStart + 1);

    // User did not pay current month, hence inellgible for the lottery
    let actions: Entry[][] = await group.reducer.fetchActions();
    let latestAction: Entry = actions[actions.length - 1][1];
    expect(latestAction.lotteryElligible.toBoolean()).toEqual(false);
  });

  it('Compensation tests two missed payment, plus current month', async () => {
    console.log('Round at the start: ', group.paymentRound.get().toString());

    let totalPaymentsStart = fetchPaid(timmy, 'Alexa start');
    let totalCompStart = fetchCompensation(timmy, 'Alexa start');

    // Compensate for two missed payments, pay current payment
    const txn2 = await Mina.transaction(timmy, async () => {
      await group.roundPayment(GROUP_SETTINGS, UInt64.zero, new UInt32(3));
    });

    await txn2.prove();
    await txn2.sign([timmy.key]).send();

    // Start payment count
    let totalPaymentsEnd = fetchPaid(timmy, 'timmy end');
    let totalCompEnd = fetchCompensation(timmy, 'timmy end');

    expect(totalPaymentsEnd).toEqual(totalPaymentsStart + 1);
    expect(totalCompEnd).toEqual(totalCompStart + 2);

    // User did not pay current month, hence inellgible for the lottery
    let actions: Entry[][] = await group.reducer.fetchActions();
    let latestAction: Entry = actions[actions.length - 1][1];
    expect(latestAction.lotteryElligible.toBoolean()).toEqual(true);
  });

  it('Compensation tests two missed payment, no current', async () => {
    // TODO: payeSehment needs to fail until compensation is done

    let totalPaymentsStart = fetchPaid(billy, 'Billy start');
    let totalCompStart = fetchCompensation(billy, 'Billy start');

    // Increment payment round by 1 from the current
    let currentRound = await incrementRound(UInt64.one);

    console.log(
      'Current round after increment: ',
      currentRound.toBigInt().toString()
    );

    // Compensate for missed payment
    const txn2 = await Mina.transaction(billy, async () => {
      await group.roundPayment(GROUP_SETTINGS, UInt64.zero, new UInt32(2));
    });

    await txn2.prove();
    await txn2.sign([billy.key]).send();

    let totalPaymentsEnd = fetchPaid(billy, 'Billy end');
    let totalCompEnd = fetchCompensation(billy, 'Billy end');

    // Assert compensation increased by 2
    expect(totalCompEnd).toEqual(totalCompStart + 2);

    // Assert payments unchanged
    expect(totalPaymentsEnd).toEqual(totalPaymentsStart);

    // User did not pay current month, hence inellgible for the lottery
    let actions: Entry[][] = await group.reducer.fetchActions();
    let latestAction: Entry = actions[actions.length - 1][1];
    expect(latestAction.lotteryElligible.toBoolean()).toEqual(false);
  });

  it('Compensation tests three missed payment (rejection)', async () => {
    // Increment payment round by 1 from the current
    let currentRound = await incrementRound(UInt64.one);

    // Compensate for missed payment
    await expect(
      Mina.transaction(bryan, async () => {
        await group.roundPayment(GROUP_SETTINGS, UInt64.zero, new UInt32(3));
      })
    ).rejects.toThrow();
  });
});
