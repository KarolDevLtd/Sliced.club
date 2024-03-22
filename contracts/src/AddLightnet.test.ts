import { Add } from './Add';

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
} from 'o1js';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = true;
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

describe('Add testing on Lightnet', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Add,
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
    if (proofsEnabled) await Add.compile();

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

    // Release previously acquired key pair
    // const keyPairReleaseMessage = await Lightnet.releaseKeyPair({
    //   publicKey: deployerAccount.toBase58(),
    // });
    // if (keyPairReleaseMessage) console.log(keyPairReleaseMessage);
    // zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Add(zkAppAddress);

    senderKey = (await Lightnet.acquireKeyPair()).privateKey;
    senderAccount = senderKey.toPublicKey();
  });

  async function localDeploy() {
    const txn = await Mina.transaction({ fee, sender: deployerAccount }, () => {
      // AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('correctly updates the num state on the `Add` smart contract', async () => {
    // await localDeploy();
    await fetchAccount({ publicKey: zkAppAddress });
    const currentNum = zkApp.num.get();
    // update transaction
    const txn = await Mina.transaction({ fee, sender: senderAccount }, () => {
      zkApp.update();
    });
    await txn.prove();
    await (await txn.sign([senderKey]).send()).wait();

    await fetchAccount({ publicKey: zkAppAddress });
    const updatedNum = zkApp.num.get();

    expect(updatedNum).toEqual(currentNum.add(Field(2)));
  });
});
