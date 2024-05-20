import {
  Poseidon,
  Field,
  State,
  state,
  PublicKey,
  method,
  UInt32,
  UInt64,
  VerificationKey,
  TokenContract,
  Bool,
  Provable,
  AccountUpdate,
  AccountUpdateForest,
} from 'o1js';

export class RandHash extends TokenContract {
  @state(Field) rand = State<Field>();
  @state(UInt32) randUInt32 = State<UInt32>();
  @state(UInt64) randUInt64 = State<UInt64>();

  async deploy() {
    await super.deploy();
  }

  @method
  async approveBase(updates: AccountUpdateForest): Promise<void> {
    this.checkZeroBalanceChange(updates);
    // TODO: event emission here
  }

  @method.returns(UInt32) async randHash(
    randomValue: Field,
    size: UInt64
  ): Promise<UInt64> {
    // Rand value that is a field
    let generatedRandomHash: Field = Poseidon.hash([
      this.network.stakingEpochData.ledger.hash.getAndRequireEquals(),
      // Below line fails at proving for some reason
      //   this.network.timestamp.getAndRequireEquals().value,
      this.network.snarkedLedgerHash.getAndRequireEquals(),
      randomValue,
    ]);

    Provable.log('Generated random hash: ', generatedRandomHash);

    let randUint32: UInt32 = UInt32.fromFields([generatedRandomHash]);
    Provable.log('Field hash 32 bits: ', randUint32);
    let randUint64: UInt64 = UInt64.fromFields([generatedRandomHash]);
    Provable.log('Field hash 64 bits: ', randUint64);

    // Base
    let modded: UInt64 = new UInt64(33);

    let val: UInt32 = new UInt32(5);
    Provable.log('Generated random hash: ', val);
    // Modulo it

    Provable.log('Modding it over: ', size);

    // Set rand
    this.randUInt32.set(randUint32);
    this.randUInt64.set(randUint64);

    return modded;
  }
}
