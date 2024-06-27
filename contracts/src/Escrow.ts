import {
  SmartContract,
  method,
  UInt64,
  AccountUpdate,
  PublicKey,
  DeployArgs,
  PrivateKey,
  state,
  State,
  Mina,
  Bool,
} from 'o1js';

import { FungibleToken } from './token/FungibleToken';

export class Escrow extends SmartContract {
  @state(PublicKey) withdrawauth = State<PublicKey>();
  @state(PublicKey) group = State<PublicKey>();
  async deploy(args: DeployArgs & { withdrawauth: PublicKey }) {
    await super.deploy(args);
    this.withdrawauth.set(args.withdrawauth);
  }

  @method async setGroup(group: PublicKey) {
    let withdrawauth: PublicKey = this.withdrawauth.getAndRequireEquals();
    this.sender.getAndRequireSignature().assertEquals(withdrawauth);
    this.group.set(group);
  }

  @method async withdraw(amount: UInt64) {
    let withdrawauth: PublicKey = this.withdrawauth.getAndRequireEquals();

    // only the withdrawauth can withdraw
    this.sender.getAndRequireSignature().assertEquals(withdrawauth);

    // withdraw the amount
    let receiverAU = this.send({
      to: withdrawauth,
      amount,
    });

    receiverAU.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;
  }

  @method async withdrawOptimized(amount: UInt64) {
    let withdrawauth: PublicKey = this.withdrawauth.getAndRequireEquals();
    let adminAU = AccountUpdate.createSigned(withdrawauth, this.tokenId); // forces withdrawauth to sign
    adminAU.body.useFullCommitment = Bool(true); // withdrawauth signs full tx so that the signature can't be reused against them

    // withdraw the amount
    this.send({ to: adminAU, amount });
    adminAU.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;
  }
}
