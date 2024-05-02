import { FungibleToken } from './token/FungibleToken';
import { GroupBasic, GroupSettings } from './GroupBasic';
import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  UInt32,
  UInt64,
  Signature,
} from 'o1js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain';

let proofsEnabled = false;
const fee = 1e8;

describe('GroupBasic', () => {
  let testAccounts: TestPublicKey[],
    deployer: TestPublicKey,
    admin: TestPublicKey,
    organiser: TestPublicKey,
    alexa: TestPublicKey,
    billy: TestPublicKey,
    charlie: TestPublicKey,
    jackie: TestPublicKey,
    groupPrivateKey = PrivateKey.random(),
    groupAddress = groupPrivateKey.toPublicKey(),
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
    if (proofsEnabled) {
      await GroupBasic.compile();
      await FungibleToken.compile();
      console.log('compiled');
    }
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployer, admin, organiser, alexa, billy, charlie, jackie] = testAccounts =
      Local.testAccounts;

    group = new GroupBasic(groupAddress);

    tokenApp = new FungibleToken(tokenAddress);
    console.log(`
    deployer ${deployer.toBase58()}
    admin ${admin.toBase58()}
    alexa ${alexa.toBase58()}
    billy ${billy.toBase58()}
    charlie ${charlie.toBase58()}
    jackie ${jackie.toBase58()}

    token ${tokenAddress.toBase58()}
    groupBasic ${groupAddress.toBase58()}
  `);
    await localDeploy();
  });

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
      await group.deploy({ admin: admin });
    });
    await deployGroupTx.prove();
    await (
      await deployGroupTx.sign([deployer.key, groupPrivateKey]).send()
    ).wait();
  }

  it('generates and deploys the `GroupBasic` smart contract', async () => {
    // const groupToken = group.tokenAddress.get();
    // expect(groupToken).toEqual(tokenAddress);
    const groupAdmin = group.admin.get();
    // console.log(group.paymentRound.get().toBigInt());
    // console.log(groupAdmin.toBase58());
    expect(groupAdmin.toBase58()).toEqual(admin.toBase58());
  });

  it('mints and distributes tokens ', async () => {
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

    const userAmount = new UInt64(2000);
    for (let i = 3; i < 7; i++) {
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
  });

  it('correctly sets the group settings ', async () => {
    let sig = Signature.create(organiser.key, GROUP_SETTINGS.toFields());
    // update transaction
    const txn = await Mina.transaction(organiser, async () => {
      await group.setGroupSettings(GROUP_SETTINGS, sig);
    });
    await txn.prove();
    await txn.sign([organiser.key]).send();

    expect(GROUP_SETTINGS.hash()).toEqual(group.groupSettingsHash.get());
  });
  it('correctly makes a payment, without bids', async () => {
    const initialBalanceAlexa = (await tokenApp.getBalanceOf(alexa)).toBigInt();
    const initialBalanceGroup = (
      await tokenApp.getBalanceOf(groupAddress)
    ).toBigInt();
    const txn = await Mina.transaction(alexa, async () => {
      AccountUpdate.fundNewAccount(alexa);
      await group.roundPayment(GROUP_SETTINGS, UInt64.from(0));
    });
    await txn.prove();
    await txn.sign([alexa.key]).send();
    expect((await tokenApp.getBalanceOf(alexa)).toBigInt()).toEqual(
      initialBalanceAlexa - paymentAmount.toBigint()
    );
    expect((await tokenApp.getBalanceOf(groupAddress)).toBigInt()).toEqual(
      initialBalanceGroup + paymentAmount.toBigint()
    );
  });

  const billyBid = UInt64.from(2);
  it('1st user correctly joins the auction', async () => {
    const initialBalanceBilly = (await tokenApp.getBalanceOf(billy)).toBigInt();
    const initialBalanceGroup = (
      await tokenApp.getBalanceOf(groupAddress)
    ).toBigInt();
    const txn = await Mina.transaction(billy, async () => {
      // AccountUpdate.fundNewAccount(billy);
      await group.roundPayment(GROUP_SETTINGS, billyBid);
    });
    await txn.prove();
    await txn.sign([billy.key]).send();
    expect((await tokenApp.getBalanceOf(billy)).toBigInt()).toEqual(
      initialBalanceBilly - paymentAmount.mul(2).toBigint()
    );
    expect((await tokenApp.getBalanceOf(groupAddress)).toBigInt()).toEqual(
      initialBalanceGroup + paymentAmount.mul(2).toBigint()
    );
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
      await group.roundPayment(GROUP_SETTINGS, charlieBid);
    });
    await txn.prove();
    await txn.sign([charlie.key]).send();
    expect((await tokenApp.getBalanceOf(charlie)).toBigInt()).toEqual(
      initialBalanceCharlie - paymentAmount.mul(2).toBigint()
    );
    expect((await tokenApp.getBalanceOf(groupAddress)).toBigInt()).toEqual(
      initialBalanceGroup + paymentAmount.mul(2).toBigint()
    );
  });
  it('correctly chooses the winners', async () => {
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
    const newPaymentRound = group.paymentRound.get();
    expect(newPaymentRound.toBigInt()).toEqual(paymentRound.add(1).toBigInt());
  });
});
