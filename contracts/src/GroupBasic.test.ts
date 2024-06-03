import { FungibleToken } from './token/FungibleToken';
import { GroupBasic, GroupSettings, Payments } from './GroupBasic';
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
  Signature,
  Bool,
} from 'o1js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain';
import { GroupUserStorage } from './GroupUserStorage';

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
    tokenKey: PrivateKey,
    groupPrivateKey = PrivateKey.random(),
    groupAddress = groupPrivateKey.toPublicKey(),
    tokenPrivateKey = PrivateKey.random(),
    tokenAddress = tokenPrivateKey.toPublicKey(),
    group: GroupBasic,
    tokenApp: FungibleToken,
    derivedTokenId: Field,
    verificationKey: VerificationKey;

  let userStart: number, userEnd: number;

  let groupRounds: number = 6;
  let missable: number = 3;
  let basePayment: UInt32 = UInt32.from(1);

  const GROUP_SETTINGS = new GroupSettings(
    new UInt32(8), // members
    new UInt32(3000), // itemPrice
    new UInt32(groupRounds), // groupDuration
    tokenAddress,
    new UInt32(missable), // groupDuration
    new UInt64(0)
  ); // 500 monthly

  const paymentAmount = GROUP_SETTINGS.itemPrice
    .div(GROUP_SETTINGS.members)
    .mul(new UInt32(2));

  beforeAll(async () => {
    //we always need to compile vk2 for tokenStorage
    // Analsye methods
    console.log('Methods analysed: \n', await GroupBasic.analyzeMethods());
    const { verificationKey: vk2 } = await GroupBasic.compile();
    verificationKey = vk2;
    if (proofsEnabled) {
      await FungibleToken.compile();
      console.log('compiled');
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
    tokenKey = PrivateKey.random();

    derivedTokenId = TokenId.derive(groupAddress);

    tokenApp = new FungibleToken(tokenAddress);
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

    token ${tokenAddress.toBase58()}
    groupBasic ${groupAddress.toBase58()}
  `);
    await localDeploy();
  });

  async function setPaymentRound(roundIndex: UInt64) {
    const txn = await Mina.transaction(admin, async () => {
      await group.roundUpdate(roundIndex);
    });
    await txn.prove();
    await txn.sign([admin.key]).send();
  }

  async function incrementRound(roundIndex: UInt64): Promise<UInt64> {
    const paymentRound = group.paymentRound.get();
    let currentRound: UInt64 = paymentRound.add(roundIndex);
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
      AccountUpdate.fundNewAccount(deployer);
      await group.deploy({
        admin: admin,
        groupSettings: GROUP_SETTINGS,
      });
    });
    await deployGroupTx.prove();
    await (
      await deployGroupTx.sign([deployer.key, groupPrivateKey]).send()
    ).wait();

    // Assert group deploy field equal to hash of the field
    expect(GROUP_SETTINGS.hash()).toEqual(group.groupSettingsHash.get());
  }

  it('Generates and deploys the `GroupBasic` smart contract', async () => {
    // const groupToken = group.tokenAddress.get();
    // expect(groupToken).toEqual(tokenAddress);
    const groupAdmin = group.admin.get();
    // console.log(group.paymentRound.get().toBigInt());
    // console.log(groupAdmin.toBase58());
    expect(groupAdmin.toBase58()).toEqual(admin.toBase58());
  });

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

    // Initially fund smart contract for stablecoin
    const initTokenStable = await Mina.transaction(
      {
        sender: admin,
        fee,
      },
      async () => {
        AccountUpdate.fundNewAccount(admin);
        await tokenApp.transfer(admin, groupAddress, new UInt64(1));
      }
    );

    await initTokenStable.prove();
    initTokenStable.sign([admin.key]);
    await initTokenStable.send().then((v) => v.wait());
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
    await txn1.sign([alexa.key, tokenKey]).send();
    await fetchAccount({
      publicKey: alexa.key.toPublicKey(),
      tokenId: derivedTokenId,
    });
    let isParticipant = new GroupUserStorage(
      alexa.key.toPublicKey(),
      derivedTokenId
    ).isParticipant.get();
    expect(isParticipant).toEqual(Bool(true));
  });

  // // it('Fails without all members being added', async () => {
  // //   await expect(
  // //     Mina.transaction(alexa, async () => {
  // //       // AccountUpdate.fundNewAccount(alexa);
  // //       await group.roundPayment(GROUP_SETTINGS, UInt64.from(0));
  // //     })
  // //   ).rejects.toThrow();
  // // });

  it('Adds remaining users to the group', async () => {
    console.log('Adding remaining users to the group', userStart, userEnd);
    for (let i = userStart + 1; i <= userEnd; i++) {
      const usersStart: number = parseInt(group.members.get().toString());
      const txn1 = await Mina.transaction(testAccounts[i], async () => {
        AccountUpdate.fundNewAccount(testAccounts[i]);
        await group.addUserToGroup(
          GROUP_SETTINGS,
          testAccounts[i].key.toPublicKey(),
          verificationKey
        );
      });
      await txn1.prove();
      await txn1.sign([testAccounts[i].key, tokenKey]).send();
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
      const usersEnd: number = parseInt(group.members.get().toString());
      // Assert one more user added in contract
      expect(usersEnd).toEqual(usersStart + 1);
    }
  });

  // xit('Fails to make a payment if user is not added to the group', async () => {
  //   await expect(
  //     Mina.transaction(deployer, async () => {
  //       AccountUpdate.fundNewAccount(deployer);
  //       await group.roundPayment(GROUP_SETTINGS, UInt64.from(0));
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

  it('Correctly makes a payment, without bids', async () => {
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
    const initialBalanceGroup = (
      await tokenApp.getBalanceOf(groupAddress)
    ).toBigInt();
    const txn = await Mina.transaction(alexa, async () => {
      // AccountUpdate.fundNewAccount(alexa);
      await group.roundPayment(GROUP_SETTINGS, UInt64.from(0), basePayment);
    });
    // console.log(txn.toPretty());
    await txn.prove();
    await txn.sign([alexa.key]).send();
    expect((await tokenApp.getBalanceOf(alexa)).toBigInt()).toEqual(
      initialBalanceAlexa - paymentAmount.toBigint()
    );
    expect((await tokenApp.getBalanceOf(groupAddress)).toBigInt()).toEqual(
      initialBalanceGroup + paymentAmount.toBigint()
    );

    // Check that it has been ticked off
    const paymentsBoolEnd: Bool[] = Payments.unpack(
      new GroupUserStorage(
        alexa.key.toPublicKey(),
        derivedTokenId
      ).payments.get()
    );
    // expect(
    //   paymentsBoolEnd[parseInt(group.paymentRound.get().toString())]
    // ).toEqual(Bool(true));

    // TODO check if paymentsBool updated correctly
  });

  const billyBid = UInt64.from(2);
  it('1st user correctly joins the auction', async () => {
    const initialBalanceBilly = (await tokenApp.getBalanceOf(billy)).toBigInt();
    const initialBalanceGroup = (
      await tokenApp.getBalanceOf(groupAddress)
    ).toBigInt();
    const txn = await Mina.transaction(billy, async () => {
      // AccountUpdate.fundNewAccount(billy);
      await group.roundPayment(GROUP_SETTINGS, billyBid, basePayment);
    });
    await txn.prove();
    await txn.sign([billy.key]).send();
    // expect((await tokenApp.getBalanceOf(billy)).toBigInt()).toEqual(
    //   initialBalanceBilly - paymentAmount.mul(2).toBigint()
    // );
    // expect((await tokenApp.getBalanceOf(groupAddress)).toBigInt()).toEqual(
    //   initialBalanceGroup + paymentAmount.mul(2).toBigint()
    // );
  });
  const charlieBid = UInt64.from(3);
  it('2nd user (higher bidder) correctly joins the auction', async () => {
    const initialBalanceCharlie = (
      await tokenApp.getBalanceOf(charlie)
    ).toBigInt();
    const initialBalanceGroup = (
      await tokenApp.getBalanceOf(groupAddress)
    ).toBigInt();
    const txn = await Mina.transaction(charlie, async () => {
      // AccountUpdate.fundNewAccount(charlie);
      await group.roundPayment(GROUP_SETTINGS, charlieBid, basePayment);
    });
    console.log('TX deets: ', txn.toPretty() + '\n');
    await txn.prove();
    await txn.sign([charlie.key]).send();
    // expect((await tokenApp.getBalanceOf(charlie)).toBigInt()).toEqual(
    //   initialBalanceCharlie - paymentAmount.mul(2).toBigint()
    // );
    // expect((await tokenApp.getBalanceOf(groupAddress)).toBigInt()).toEqual(
    //   initialBalanceGroup + paymentAmount.mul(2).toBigint()
    // );
  });
  it('Correctly chooses the winners', async () => {
    const paymentRound = group.paymentRound.get();
    const randomIndex = Math.floor(Math.random() * 20);
    const txn = await Mina.transaction(admin, async () => {
      await group.getResults(
        GROUP_SETTINGS,
        admin.key,
        Field.from(randomIndex)
      );
    });
    await txn.prove();
    await txn.sign([admin.key]).send();
    for (const event of await group.fetchEvents()) {
      console.log(event.type, JSON.stringify(event.event.data));
    }

    const newPaymentRound = group.paymentRound.get();
    // expect(newPaymentRound.toBigInt()).toEqual(paymentRound.add(1).toBigInt());
  });

  // it('Compensation tests one missed payment', async () => {
  //   // TODO: payeSehment needs to fail until compensation is done

  //   // Increment payment round by 2 from the current
  //   let currentRound = await incrementRound(new UInt64(2));
  //   console.log(
  //     'Current round after increment: ',
  //     currentRound.toBigInt().toString()
  //   );

  //   // let totalMissed = await group.totalMissedHandle(alexa);
  //   // console.log(
  //   //   '[1] Total missed payments: ',
  //   //   totalMissed.toBigint().toString()
  //   // );

  //   // Get starting payment bool array
  //   const paymentsUser = group.paymentRound.get();
  //   let ud = new GroupUserStorage(alexa, group.deriveTokenId());
  //   let paymentsFieldStart = ud.payments.getAndRequireEquals();

  //   // let paidBeforeComp: number = parseInt(
  //   //   await ud.totalPayments.get().toString()
  //   // );

  //   // console.log('Balance prior to compensation: ', paidBeforeComp);

  //   // Compensate for missed payment
  //   const txn2 = await Mina.transaction(alexa, async () => {
  //     await group.compensate(GROUP_SETTINGS, UInt32.one);
  //   });

  //   await txn2.prove();
  //   await txn2.sign([alexa.key]).send();

  //   let paidAfterComp: number = parseInt(
  //     await ud.totalPayments.get().toString()
  //   );
  //   console.log('Balance after the compensation: ', paidAfterComp);

  //   // Ensure that total payment is higher now
  //   // expect(paidAfterComp == paidBeforeComp + 1);

  //   // Ensure payments field is unchanged
  //   let paymentsFieldEnd = ud.payments.getAndRequireEquals();
  //   // expect(paymentsFieldStart == paymentsFieldEnd);
  // });

  // it('Compensation tests two missed payment', async () => {
  //   // TODO: payeSehment needs to fail until compensation is done

  //   // Increment payment round by 1 from the current
  //   let currentRound = await incrementRound(UInt64.one);

  //   console.log(
  //     'Current round after increment: ',
  //     currentRound.toBigInt().toString()
  //   );

  //   // let totalMissed = await group.totalMissedHandle(billy);
  //   // console.log(
  //   //   '[2] Total missed payments: ',
  //   //   totalMissed.toBigint().toString()
  //   // );

  //   // Get starting payment bool array
  //   // const paymentsUser = group.paymentRound.get();
  //   let ud = new GroupUserStorage(billy, group.deriveTokenId());
  //   let paymentsFieldStart = ud.payments.getAndRequireEquals();

  //   // let paidBeforeComp: number = parseInt(
  //   //   (await group.totalPaymentsHandle(billy)).toString()
  //   // );

  //   // console.log('Balance prior to compensation: ', paidBeforeComp);

  //   // Compensate for missed payment
  //   const txn2 = await Mina.transaction(billy, async () => {
  //     await group.compensate(GROUP_SETTINGS, new UInt32(2));
  //   });

  //   await txn2.prove();
  //   await txn2.sign([billy.key]).send();

  //   // let paidAfterComp: number = parseInt(
  //   //   (await group.totalPaymentsHandle(billy)).toString()
  //   // );
  //   // console.log('Balance after the compensation: ', paidAfterComp);

  //   // Ensure that total payment is higher now
  //   // expect(paidAfterComp == paidBeforeComp + 2);

  //   // Ensure payments field is unchanged
  //   let paymentsFieldEnd = ud.payments.getAndRequireEquals();
  //   // expect(paymentsFieldStart == paymentsFieldEnd);
  // });

  // // xit('Compensation tests three missed payment', async () => {
  // //   // Increment payment round by 1 from the current
  // //   let currentRound = await incrementRound(UInt64.one);
  // //   console.log(
  // //     'Current round after increment: ',
  // //     currentRound.toBigInt().toString()
  // //   );

  // //   let totalMissed = await group.totalMissedHandle(bryan);
  // //   console.log(
  // //     '[3] Total missed payments: ',
  // //     totalMissed.toBigint().toString()
  // //   );

  // //   // Get starting payment bool array
  // //   let ud = new GroupUserStorage(bryan, group.deriveTokenId());
  // //   let paymentsFieldStart = ud.payments.getAndRequireEquals();

  // //   let paidBeforeComp: number = parseInt(
  // //     (await group.totalPaymentsHandle(bryan)).toString()
  // //   );

  // //   console.log('Balance prior to compensation: ', paidBeforeComp);

  // //   // Compensate for missed payment
  // //   const txn2 = await Mina.transaction(bryan, async () => {
  // //     await group.compensate(GROUP_SETTINGS, UInt32.one);
  // //   });

  // //   console.log('Proving compensation');
  // //   await txn2.prove();
  // //   console.log('Proved');
  // //   await txn2.sign([bryan.key]).send();

  // //   let paidAfterComp: number = parseInt(
  // //     (await group.totalPaymentsHandle(bryan)).toString()
  // //   );
  // //   console.log('Balance after the compensation: ', paidAfterComp);

  // //   // Ensure that total payment is higher now
  // //   expect(paidAfterComp == paidBeforeComp + 1);

  // //   // Ensure payments field is unchanged
  // //   let paymentsFieldEnd = ud.payments.getAndRequireEquals();
  // //   expect(paymentsFieldStart == paymentsFieldEnd);
  // // });
});
