import { FungibleToken } from './token/FungibleToken';

import fs from 'fs/promises';
import {
  Field,
  Lightnet,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  NetworkId,
  fetchAccount,
  UInt64,
} from 'o1js';

const DEFAULT_NETWORK_ID = 'testnet';
type Config = {
  deployAliases: Record<
    string,
    {
      networkId?: string;
      url: string;
      keyPath: string;
      fee: string;
      feepayerKeyPath: string;
      feepayerAlias: string;
    }
  >;
};

describe('FungibleToken testing on Lightnet', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: FungibleToken,
    fee: number;

  beforeAll(async () => {
    // parse config and private key from file
    let configJson: Config = JSON.parse(
      await fs.readFile('config.json', 'utf8')
    );
    let config = configJson.deployAliases['lightnet1'];
    let feepayerKeysBase58: { privateKey: string; publicKey: string } =
      JSON.parse(await fs.readFile(config.feepayerKeyPath, 'utf8'));

    let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
      await fs.readFile(config.keyPath, 'utf8')
    );

    deployerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
    zkAppPrivateKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
    await FungibleToken.compile();

    // set up Mina instance and contract we interact with
    const Network = Mina.Network({
      networkId: (config.networkId ?? DEFAULT_NETWORK_ID) as NetworkId,
      mina: config.url,
      archive: 'http://localhost:8282',
      lightnetAccountManager: 'http://localhost:8181',
    });
    fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
    Mina.setActiveInstance(Network);

    // Fee payer setup
    deployerAccount = deployerKey.toPublicKey();
    console.log('deployer:', deployerAccount.toBase58());
    // Release previously acquired key pair
    // const keyPairReleaseMessage = await Lightnet.releaseKeyPair({
    //   publicKey: deployerAccount.toBase58(),
    // });
    // if (keyPairReleaseMessage) console.log(keyPairReleaseMessage);
    // zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new FungibleToken(zkAppAddress);
    console.log('tokenAddr:', zkAppAddress.toBase58());
    senderKey = (await Lightnet.acquireKeyPair()).privateKey;
    senderAccount = senderKey.toPublicKey();
  });

  it('correctly deploys the `FungibleToken` smart contract', async () => {
    const supply = UInt64.from(10_000_000_000_000);
    const txn = await Mina.transaction(
      { fee, sender: deployerAccount },
      async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        await zkApp.deploy({
          owner: deployerAccount,
          supply,
          symbol: 'mUSD',
          src: 'source code link',
        });
      }
    );
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await (await txn.sign([deployerKey, zkAppPrivateKey]).send()).wait();
    await fetchAccount({ publicKey: zkAppAddress });
    const currentNum = await zkApp.getSupply();
    expect(currentNum).toEqual(supply);
  });

  it('correctly mints tokens ', async () => {
    const reciverAddr = PublicKey.fromBase58(
      'B62qoieVGvjyewFce6ZQkVvewVVA5jxVKKA4k3KT3LvxaLTdE2QsEbW'
    );
    const amount = new UInt64(1000);
    const txn = await Mina.transaction(
      { fee, sender: deployerAccount },
      async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        await zkApp.mint(reciverAddr, amount);
      }
    );
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await (await txn.sign([deployerKey, zkAppPrivateKey]).send()).wait();

    await fetchAccount({ publicKey: zkAppAddress });
    expect(await zkApp.getBalanceOf(reciverAddr)).toEqual(amount);
  });
});
