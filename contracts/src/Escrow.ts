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
  Provable,
} from 'o1js';

import { FungibleToken } from './token/FungibleToken';
import { GroupBasic } from './GroupBasic';

export class Escrow extends SmartContract {
  @state(PublicKey) withdrawauth = State<PublicKey>();
  @state(PublicKey) group = State<PublicKey>();
  @state(UInt64) withdrawable = State<UInt64>();
  async deploy(args: DeployArgs & { withdrawauth: PublicKey }) {
    await super.deploy(args);
    this.withdrawauth.set(args.withdrawauth);
  }

  @method async setGroup(group: PublicKey) {
    let withdrawauth: PublicKey = this.withdrawauth.getAndRequireEquals();
    this.sender.getAndRequireSignature().assertEquals(withdrawauth);
    this.group.set(group);
  }

  @method async setWithdawable(amount: UInt64) {
    let withdrawauth: PublicKey = this.withdrawauth.getAndRequireEquals();
    this.sender.getAndRequireSignature().assertEquals(withdrawauth);
    let currentWithdrawable = this.withdrawable.getAndRequireEquals();
    this.withdrawable.set(currentWithdrawable.add(amount));
  }

  @method async withdraw(amount: UInt64) {
    let withdrawauth: PublicKey = this.withdrawauth.getAndRequireEquals();

    // only the withdrawauth can withdraw
    // this.sender.getAndRequireSignature().assertEquals(withdrawauth);

    // Check if the caller is set as the organiser of the group
    // let group: PublicKey = this.group.getAndRequireEquals();

    // // Spawn group
    // let groupBasic = new GroupBasic(group);

    // this.sender
    //   .getAndRequireSignature()
    //   .assertEquals(groupBasic.admin.getAndRequireEquals());

    Provable.log('Withdraw here bruv');

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

    // Fetch what can be withdrawn
    // let amount = this.withdrawable.getAndRequireEquals();

    // withdraw the amount
    this.send({ to: adminAU, amount });
    adminAU.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;

    // Set wothdrawable to 0
    this.withdrawable.set(UInt64.from(0));
  }
}
