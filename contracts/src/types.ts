import {
  Field,
  SmartContract,
  state,
  State,
  Bool,
  UInt32,
  UInt64,
  Group,
  Struct,
  PublicKey,
  Poseidon,
} from 'o1js';
import { PackedBoolFactory } from './lib/packed-types/PackedBool';

export class Payments extends PackedBoolFactory(251) {}
type CipherText = {
  publicKey: Group;
  cipherText: Field[];
};
export class Entry extends Struct({
  publicKey: PublicKey,
  // message: { //TODO
  //   publicKey: Group,
  //   cipherText: Field[],
  // },
  message: UInt64,
  paymentRound: UInt64,
  /** It's auction if false */
  isLottery: Bool,
  /** Set to true if user up to date on payments */
  lotteryElligible: Bool,
}) {
  constructor(
    publicKey: PublicKey,
    message: UInt64,
    paymentRound: UInt64,
    isLottery: Bool,
    lotteryElligible: Bool
  ) {
    super({
      publicKey,
      message,
      paymentRound,
      isLottery,
      lotteryElligible,
    });
  }
  hash(): Field {
    return Poseidon.hash(Entry.toFields(this));
  }
  toFields(): Field[] {
    return Entry.toFields(this);
  }
}

export class GroupSettings extends Struct({
  members: UInt32,
  itemPrice: UInt32,
  /** In payment rounds */
  groupDuration: UInt32,
  /** Stablecoin token */
  tokenAddress: PublicKey,
  /** Number of payments that can be missed */
  missable: UInt32,
  /** Duration of each payment round in seconds */
  payemntDuration: UInt64,
}) {
  constructor(
    members: UInt32,
    itemPrice: UInt32,
    groupDuration: UInt32,
    tokenAddress: PublicKey,
    missable: UInt32,
    payemntDuration: UInt64
  ) {
    super({
      members,
      itemPrice,
      groupDuration,
      tokenAddress,
      missable,
      payemntDuration,
    });
  }
  hash(): Field {
    return Poseidon.hash(GroupSettings.toFields(this));
  }
  toFields(): Field[] {
    return GroupSettings.toFields(this);
  }
  static empty<T extends new (...args: any) => any>(): InstanceType<T> {
    return new GroupSettings(
      new UInt32(0),
      new UInt32(0),
      new UInt32(0),
      PublicKey.empty(),
      new UInt32(0),
      new UInt64(0)
    ) as any;
  }
}
export class PaymentEvent extends Struct({
  paymentRound: UInt64,
  paymentAmount: UInt64,
  userPubKey: PublicKey,
  timestamp: UInt32,
}) {
  constructor(
    paymentRound: UInt64,
    paymentAmount: UInt64,
    userPubKey: PublicKey,
    timestamp: UInt32
  ) {
    super({
      paymentRound,
      paymentAmount,
      userPubKey,
      timestamp,
    });
  }
}
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
