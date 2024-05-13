import { Field, SmartContract, state, State, method, Provable } from 'o1js';

/** Stores users details for particular group */
export class GroupUserStorage extends SmartContract {
  @state(Field) payments = State<Field>();
  @state(Field) overpayments = State<Field>();
  @state(Field) compensations = State<Field>();
}
