import {
  SmartContract,
  method,
  UInt64,
  AccountUpdate,
  PrivateKey,
  Mina,
  Bool,
} from 'o1js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain';
import { FungibleToken } from './token/FungibleToken';
import { Escrow } from './Escrow';

describe('Escrow', () => {
  let deployer: TestPublicKey, admin: TestPublicKey, group: TestPublicKey;
  let escrowKey = PrivateKey.random();
  let escrowAddress = escrowKey.toPublicKey();
  let escrow: Escrow;
  let token: FungibleToken;

  it('Set-up', async () => {
    const tokenKey = PrivateKey.random();
    const tokenAddress = tokenKey.toPublicKey();

    let Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    [admin, deployer] = Local.testAccounts;
    token = new FungibleToken(tokenAddress);
    const tokenId = token.deriveTokenId();
    escrow = new Escrow(escrowAddress, tokenId);

    await Mina.transaction(admin, async () => {
      // deploy token contract
      await token.deploy({
        owner: admin,
        supply: UInt64.from(10_000_000_000_000),
        symbol: 'mUSD',
        src: 'source code link',
      });

      AccountUpdate.fundNewAccount(admin, 1).send({
        to: token.self,
        amount: 1e9,
      });
    })
      .sign([admin.key, tokenKey])
      .prove()
      .send();

    console.log('Admin', admin.toBase58());
    console.log('Deployer', deployer.toBase58());
    let adminToken: AccountUpdate;

    let tx0 = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer, 2);
      adminToken = AccountUpdate.create(admin, tokenId);
      await escrow.deploy({ admin });
      await token.approveAccountUpdates([adminToken, escrow.self]);
    });

    // console.log('deploy tx', tx.toPretty());
    await tx0.sign([deployer.key, escrowKey]).prove();
    await tx0.send();
    console.log('Deployed escrow and approved admin');

    // Create token account for admin and escrow
    let tx1 = await Mina.transaction(admin, async () => {
      AccountUpdate.fundNewAccount(admin, 2);
      AccountUpdate.create(escrowAddress, tokenId);
      AccountUpdate.create(tokenAddress, tokenId);
    });

    await tx1.sign([admin.key, escrowKey]).prove();
    console.log('Created token accounts');

    const tokenMasterbalance = (
      await token.getBalanceOf(tokenAddress)
    ).toBigInt();
    console.log('Token master balance', tokenMasterbalance);

    // Mint tokens to the token address
    let tx2 = await Mina.transaction(admin, async () => {
      await token.mint(admin, UInt64.from(1000));
    })
      .sign([admin.key])
      .prove()
      .send();

    const tokenMasterbalance2 = (await token.getBalanceOf(admin)).toBigInt();
    console.log('Token admin balance', tokenMasterbalance2);

    let tx3 = await Mina.transaction(admin, async () => {
      await token.transfer(admin, escrowAddress, UInt64.from(1000));
    })
      .sign([admin.key])
      .prove()
      .send();

    // console.log('Submittign escrow tx 1');
    let tx4 = await Mina.transaction(admin, async () => {
      await escrow.withdraw(UInt64.from(500));
      // token-approve the withdrawal
      await token.approveAccountUpdate(escrow.self);
    })
      .sign([admin.key])
      .prove()
      .send();

    // withdraw from escrow (optimized, creates only 3 account updates)
    let tx5 = await Mina.transaction(admin, async () => {
      await escrow.withdrawOptimized(UInt64.from(500));

      // token-approve the withdrawal
      await token.approveAccountUpdate(escrow.self);
    })
      .sign([admin.key])
      .prove()
      .send();
  });

  it('Admin setspermitted group', async () => {
    console.log('Admin', admin.toBase58());

    let tx = await Mina.transaction(admin, async () => {
      await escrow.setGroup(group);
    })
      .sign([admin.key])
      .prove()
      .send();
  });
});
