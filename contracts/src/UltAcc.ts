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

interface keyType {
  key: TestPublicKey | PrivateKey;
}

export class Acc {
  key: keyType;
  constructor(key: keyType) {
    this.key = key;
  }
}

// Class that stores accounts
export class UltAcc {
  accounts: Acc[] = [];
  constructor(accounts?: Acc[]) {
    if (accounts) {
      this.accounts = accounts;
    }
  }

  // Function to add an account
  addAccount(): void {
    // Spawn private key
    let privateKey: PrivateKey = PrivateKey.random();
    this.accounts.push(new Acc({ key: privateKey }));
  }

  // Pre fund for mina for now
  async preFund(): Promise<void> {
    // Split account sinto those with testPublicKey and those with PrivateKey
    let privateKeyAccounts: Acc[] = [];
    for (let account of this.accounts) {
      if ('key' in account.key) {
        privateKeyAccounts.push(account);
      }
    }

    // // Get the first account
    // let account = this.accounts[0];
    // // Get the public key
    // let publicKey: PublicKey = account.key.key.toPublicKey();
    // // Fetch the account
    // let fetchedAccount = await fetchAccount(publicKey);
    // // If the account does not exist
    // if (!fetchedAccount) {
    // // Create the account
    // await Mina.createAccount(publicKey);
    // }
    // // Fund the account
    // await Mina.fundAccount(publicKey, new UInt64(1000000000000));
  }
}
