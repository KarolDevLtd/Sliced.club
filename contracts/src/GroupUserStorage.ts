import { Field, SmartContract, state, State, Bool, UInt32 } from 'o1js';

/** Stores users details for particular group */
export class GroupUserStorage extends SmartContract {
  @state(Field) payments = State<Field>();
  @state(UInt32) overpayments = State<UInt32>();
  @state(Field) compensations = State<Field>();
  @state(Bool) isParticipant = State<Bool>();
  @state(UInt32) totalPayments = State<UInt32>();
}
