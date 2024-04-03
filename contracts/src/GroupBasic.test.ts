import { FungibleToken } from './FungibleToken';
import { GroupBasic, GroupSettings } from './GroupBasic';
import { TestAccount, TestAccounts } from './test_utils';
import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  UInt32,
  UInt64,
} from 'o1js';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false; // TODO fix groupSettingHash.getAndRequireEquals
const fee = 1e8;

describe('GroupBasic', () => {
  let testAccounts: TestAccounts,
    deployer: TestAccount,
    admin: TestAccount,
    organiser: TestAccount,
    alexa: TestAccount,
    billy: TestAccount,
    charlie: TestAccount,
    jackie: TestAccount,
    groupPrivateKey: PrivateKey,
    groupAddress: PublicKey,
    tokenPrivateKey = PrivateKey.random(),
    tokenAddress = tokenPrivateKey.toPublicKey(),
    group: GroupBasic,
    tokenApp: FungibleToken;

  const GROUP_SETTINGS = new GroupSettings(
    new UInt32(12), // maxMembers
    new UInt32(3000), // itemPrice
    new UInt32(6), // groupDuration
    tokenAddress
  ); // 500 monthly

  const paymentAmount = GROUP_SETTINGS.itemPrice
    .div(GROUP_SETTINGS.maxMembers)
    .mul(new UInt32(2));

  beforeAll(async () => {
    if (proofsEnabled) await GroupBasic.compile();
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployer, admin, organiser, alexa, billy, charlie, jackie] = testAccounts =
      Local.testAccounts as TestAccounts;

    groupPrivateKey = PrivateKey.random();
    groupAddress = groupPrivateKey.toPublicKey();
    group = new GroupBasic(groupAddress);

    tokenApp = new FungibleToken(tokenAddress);
    console.log(`
    deployer ${deployer.publicKey.toBase58()}
    admin ${admin.publicKey.toBase58()}
    alexa ${alexa.publicKey.toBase58()}
    billy ${billy.publicKey.toBase58()}
    charlie ${charlie.publicKey.toBase58()}
    jackie ${jackie.publicKey.toBase58()}

    token ${tokenAddress.toBase58()}
    groupBasic ${groupAddress.toBase58()}
  `);
    await localDeploy();
  });

  async function localDeploy() {
    const deployTokenTx = await Mina.transaction(deployer.publicKey, () => {
      AccountUpdate.fundNewAccount(deployer.publicKey);
      tokenApp.deploy({
        owner: admin.publicKey,
        supply: UInt64.from(10_000_000_000_000),
        symbol: 'mUSD',
        src: 'source code link',
      });
    });
    await deployTokenTx.prove();
    await (
      await deployTokenTx.sign([deployer.privateKey, tokenPrivateKey]).send()
    ).wait();
    const txn = await Mina.transaction(deployer.publicKey, () => {
      AccountUpdate.fundNewAccount(deployer.publicKey);
      group.deploy({ admin: admin.publicKey });
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployer.privateKey, groupPrivateKey]).send();
  }

  it('generates and deploys the `GroupBasic` smart contract', async () => {
    // const groupToken = group.tokenAddress.get();
    // expect(groupToken).toEqual(tokenAddress);
    const groupAdmin = group.admin.get();
    expect(groupAdmin).toEqual(admin.publicKey);
  });

  it('mints and distributes tokens ', async () => {
    const mintAmount = new UInt64(1_000_000_000);
    const initialBalanceAdmin = tokenApp
      .getBalanceOf(admin.publicKey)
      .toBigInt();
    const mintTx = await Mina.transaction(
      {
        sender: admin.publicKey,
        fee,
      },
      () => {
        AccountUpdate.fundNewAccount(admin.publicKey);
        tokenApp.mint(admin.publicKey, mintAmount);
      }
    );
    await mintTx.prove();
    mintTx.sign([admin.privateKey]);
    await mintTx.send().then((v) => v.wait());
    expect(tokenApp.getBalanceOf(admin.publicKey).toBigInt()).toEqual(
      initialBalanceAdmin + mintAmount.toBigInt()
    );

    const userAmount = new UInt64(2000);
    for (let i = 3; i < 5; i++) {
      const transferTx = await Mina.transaction(
        {
          sender: admin.publicKey,
          fee,
        },
        () => {
          AccountUpdate.fundNewAccount(admin.publicKey);
          tokenApp.transfer(
            admin.publicKey,
            testAccounts[i].publicKey,
            userAmount
          );
        }
      );
      await transferTx.prove();
      transferTx.sign([admin.privateKey]);
      await transferTx.send().then((v) => v.wait());
      expect(
        tokenApp.getBalanceOf(testAccounts[i].publicKey).toBigInt()
      ).toEqual(userAmount.toBigInt());
    }
  });

  it('correctly sets the group settings ', async () => {
    // update transaction
    const txn = await Mina.transaction(organiser.publicKey, () => {
      group.setGroupSettings(GROUP_SETTINGS);
    });
    await txn.prove();
    await txn.sign([organiser.privateKey]).send();

    expect(GROUP_SETTINGS.hash()).toEqual(group.groupSettingsHash.get());
  });

  it('correctly makes a payment', async () => {
    const initialBalanceAlexa = tokenApp
      .getBalanceOf(alexa.publicKey)
      .toBigInt();
    const initialBalanceGroup = tokenApp.getBalanceOf(groupAddress).toBigInt();
    const txn = await Mina.transaction(alexa.publicKey, () => {
      AccountUpdate.fundNewAccount(alexa.publicKey);
      group.makePayment(GROUP_SETTINGS);
    });
    await txn.prove();
    await txn.sign([alexa.privateKey]).send();
    expect(tokenApp.getBalanceOf(alexa.publicKey).toBigInt()).toEqual(
      initialBalanceAlexa - paymentAmount.toBigint()
    );
    expect(tokenApp.getBalanceOf(groupAddress).toBigInt()).toEqual(
      initialBalanceGroup + paymentAmount.toBigint()
    );
  });
});
