import { Field, SmartContract, state, State, Bool } from 'o1js';

/** Stores users details for particular group */
export class GroupUserStorage extends SmartContract {
  @state(Field) payments = State<Field>();
  @state(Field) overpayments = State<Field>();
  @state(Field) compensations = State<Field>();
  @state(Bool) isParticipant = State<Bool>();
}
