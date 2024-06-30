import { Field, SmartContract, state, State, Bool, UInt32, UInt64 } from 'o1js';

export const groupStorageIndexes = {
  payments: 0,
  compensations: 1,
  overpayments: 2,
  isParticipant: 3,
  canClaim: 4,
  bidPayment: 5,
  claimed: 6,
  idVerified: 7,
};

/** Stores users details for particular group */
export class GroupUserStorage extends SmartContract {
  @state(Field) payments = State<Field>();
  @state(Field) compensations = State<Field>();
  @state(UInt32) overpayments = State<UInt32>();
  @state(Bool) isParticipant = State<Bool>();
  @state(Bool) canClaim = State<Bool>();
  /** How much they need to transfer to be complain */
  @state(Field) bidPayment = State<Field>();
  @state(Bool) claimed = State<Bool>();
  @state(Bool) idVerified = State<Bool>();
}
