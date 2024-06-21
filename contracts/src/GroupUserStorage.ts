import { Field, SmartContract, state, State, Bool, UInt32 } from 'o1js';

/** Stores users details for particular group */
export class GroupUserStorage extends SmartContract {
  @state(Field) payments = State<Field>();
  @state(Field) compensations = State<Field>();
  @state(UInt32) overpayments = State<UInt32>();
  @state(Bool) isParticipant = State<Bool>();
  @state(Bool) canClaim = State<Bool>();
  @state(Bool) claimed = State<Bool>();
  @state(Bool) isAdmin = State<Bool>();
}
