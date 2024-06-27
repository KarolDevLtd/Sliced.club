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
  @state(PublicKey) admin = State<PublicKey>();
  async deploy(args: DeployArgs & { admin: PublicKey }) {
    await super.deploy(args);
    this.admin.set(args.admin);
  }

  @method async withdraw(amount: UInt64) {
    let admin: PublicKey = this.admin.getAndRequireEquals();

    // only the admin can withdraw
    this.sender.getAndRequireSignature().assertEquals(admin);

    // withdraw the amount
    let receiverAU = this.send({
      to: admin,
      amount,
    });

    receiverAU.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;
  }

  @method async withdrawOptimized(amount: UInt64) {
    let admin: PublicKey = this.admin.getAndRequireEquals();
    let adminAU = AccountUpdate.createSigned(admin, this.tokenId); // forces admin to sign
    adminAU.body.useFullCommitment = Bool(true); // admin signs full tx so that the signature can't be reused against them

    // withdraw the amount
    this.send({ to: adminAU, amount });
    adminAU.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;
  }
}
