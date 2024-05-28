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
  provable,
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

  /** This function normalises within a range */
  @method async randHashTest(input: UInt64, xMax: UInt64, yMax: UInt64) {
    // Call randHash below
    let val = await this.randHash(input, xMax, yMax);

    Provable.log('val code: ', val.value);

    // Set the state for testing
    this.randUInt64.set(val);
  }

  /** This function normalises within a range */
  @method.returns(UInt32) async randHash(
    input: UInt64,
    xMax: UInt64,
    yMax: UInt64
  ): Promise<UInt64> {
    // Provable.log('Modding it over: ', size);

    Provable.log('Input value: ', input.value);
    Provable.log('xMax value: ', xMax.value);
    Provable.log('yMax value: ', yMax.value);

    // Not to lose resoluton, and trunacte to zero need to first
    // 1. Mask first half of the number (field or uint)
    // 2. Multiply what remians to bring it up to the max of the allowed resolution

    // Scaling from range [0, x_max] to [0, y_max]
    // This transformation adjusts values from an original range [0, x_max] to a new range [0, y_max].
    // Formula: y = v * (y_max / x_max)
    // 'v' is the value within the original range [0, x_max].
    // 'x_max' is the defined maximum of the original range.
    // 'y_max' is the defined maximum of the new range.

    // Mask the fie;d syntax
    //  let revealBits: Bool[] = input.toBits();
    //  let filterd = new Array<Bool>(7);
    //  for (let i = 0; i < 7; i++) {
    //    filterd[i] = revealBits[i];
    //  }

    // Shift forward by bytes (pre scale it)

    // returns linearly scaled value
    let scalingFactor = yMax.div(xMax);

    Provable.log('Scaling factor: ', scalingFactor.value);

    let scaledValue = input.mul(scalingFactor);

    return scaledValue;
  }
}
