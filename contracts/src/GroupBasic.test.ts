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

let proofsEnabled = false;

describe('GroupBasic', () => {
  let deployer: TestAccount,
    sender: TestAccount,
    admin: TestAccount,
    alexa: TestAccount,
    billy: TestAccount,
    charlie: TestAccount,
    jackie: TestAccount,
    groupAddress: PublicKey,
    groupPrivateKey: PrivateKey,
    tokenAddress: PublicKey,
    tokenPrivateKey: PrivateKey,
    group: GroupBasic,
    tokenApp: FungibleToken;

  const GROUP_SETTINGS = new GroupSettings(
    new UInt32(12), // maxMembers
    new UInt32(3000), // itemPrice
    new UInt32(6) // groupDuration
  ); // 500 monthly
  beforeAll(async () => {
    if (proofsEnabled) await GroupBasic.compile();
  });

  beforeAll(async () => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployer, sender, admin, alexa, billy, charlie, jackie] =
      Local.testAccounts as TestAccounts;
    groupPrivateKey = PrivateKey.random();
    groupAddress = groupPrivateKey.toPublicKey();
    group = new GroupBasic(groupAddress);
    tokenPrivateKey = PrivateKey.random();
    tokenAddress = tokenPrivateKey.toPublicKey();
    tokenApp = new FungibleToken(tokenAddress);
    console.log(`
    deployer ${deployer.publicKey.toBase58()}
    admin ${admin.publicKey.toBase58()}
    alexa ${alexa.publicKey.toBase58()}
    billy ${billy.publicKey.toBase58()}
    charlie ${charlie.publicKey.toBase58()}
    jackie ${jackie.publicKey.toBase58()}

    token ${tokenAddress.toBase58()}
    groupBasic ${tokenAddress.toBase58()}
  `);
    await localDeploy();
  });

  async function localDeploy() {
    const deployTokenTx = await Mina.transaction(deployer.publicKey, () => {
      AccountUpdate.fundNewAccount(deployer.publicKey);
      tokenApp.deploy({
        owner: deployer.publicKey,
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
      group.deploy({ tokenAddress, admin: admin.publicKey });
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployer.privateKey, groupPrivateKey]).send();
  }

  it('generates and deploys the `GroupBasic` smart contract', async () => {
    const groupToken = group.tokenAddress.get();
    expect(groupToken).toEqual(tokenAddress);
    const groupAdmin = group.admin.get();
    expect(groupAdmin).toEqual(admin.publicKey);
  });

  it('correctly sets the group settings ', async () => {
    // update transaction
    const txn = await Mina.transaction(sender.publicKey, () => {
      group.setGroupSettings(GROUP_SETTINGS);
    });
    await txn.prove();
    await txn.sign([sender.privateKey]).send();

    expect(GROUP_SETTINGS.hash()).toEqual(group.groupSettingsHash.get());
  });

  it('correctly makes a payment', async () => {
    const txn = await Mina.transaction(sender.publicKey, () => {
      group.makePayment(GROUP_SETTINGS);
    });
    await txn.prove();
    await txn.sign([sender.privateKey]).send();
  });
});
