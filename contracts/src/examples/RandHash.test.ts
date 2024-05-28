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

import { RandHash } from './RandHash';

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
    tokenKey: PrivateKey,
    randHashPrivateKey = PrivateKey.random(),
    randHashAddress = randHashPrivateKey.toPublicKey(),
    tokenPrivateKey = PrivateKey.random(),
    tokenAddress = tokenPrivateKey.toPublicKey(),
    randHash: RandHash,
    derivedTokenId: Field;

  beforeAll(async () => {
    //we always need to compile vk2 for tokenStorage

    if (proofsEnabled) {
      await RandHash.compile();
    }
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployer, admin, organiser, alexa, billy, charlie, jackie] = testAccounts =
      Local.testAccounts;

    randHash = new RandHash(randHashAddress);
    tokenKey = PrivateKey.random();

    derivedTokenId = TokenId.derive(randHashAddress);

    console.log(`
    deployer ${deployer.toBase58()}
    admin ${admin.toBase58()}
    alexa ${alexa.toBase58()}
    billy ${billy.toBase58()}
    charlie ${charlie.toBase58()}
    jackie ${jackie.toBase58()}

    token ${tokenAddress.toBase58()}
    groupBasic ${randHashAddress.toBase58()}
  `);
    await localDeploy();
  });

  async function localDeploy() {
    const deployGroupTx = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await randHash.deploy();
    });
    await deployGroupTx.prove();
    await (
      await deployGroupTx.sign([deployer.key, randHashPrivateKey]).send()
    ).wait();
  }

  it('Randy', async () => {
    // Cant't get block hash so for now need to provide the "vrf" value

    let yMax: number = 20;

    for (let i = 0; i < 10; i++) {
      // Number to test
      let rand = Math.floor(Math.random() * 400) + 200;

      console.log('Random number: ', rand);

      const txn1 = await Mina.transaction(alexa, async () => {
        await randHash.randHashTest(
          new UInt64(rand),
          // UInt64.MAXINT(),
          new UInt64(1000),
          new UInt64(yMax)
        );
      });
      await txn1.prove();
      let moddedVal = await txn1.sign([alexa.key, tokenKey]).send();

      // fetch value
      let uint64 = await randHash.randUInt64.get();

      console.log('Normalised value', uint64.toString());

      // Ensure its within range
      expect(parseInt(uint64.toString())).toBeLessThanOrEqual(yMax);
      expect(parseInt(uint64.toString())).toBeGreaterThanOrEqual(0);
    }
  });
});
