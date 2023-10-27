import {
  type Sender,
  type Receiver,
  type SenderCallback,
  type ReceiverCallback,
  type Receivable,
  getReceiver,
  getSender,
  type Sendable,
} from './protocol';

export const selectState = Symbol('ts-chan.selectState');

/**
 * SelectCase models the state of a single case in a {@link Select}.
 * WARNING: The selectState symbol is deliberately not exported, as the
 * value of `SelectCase[selectState]` is not part of the API contract, and
 * is simply a mechanism to support typing.
 */
export type SelectCase<T> =
  | SelectCaseSender<T>
  | SelectCaseReceiver<T>
  | SelectCasePromise<T>;

export type SelectCaseSender<T> = {
  [selectState]: CaseStateSender<T>;
};

export type SelectCaseReceiver<T> = {
  [selectState]: CaseStateReceiver<T>;
};

export type SelectCasePromise<T> = {
  [selectState]: CaseStatePromise<T>;
};

export type CaseStateSender<T> = CaseStateCommon & {
  // where to send values
  send: Sender<T>;
  // generates values to send
  scb: SenderCallback<T>;
  // indicates if scb has been added to the sender
  hscb: boolean;

  recv?: undefined;
  rcb?: undefined;
  hrcb?: undefined;

  prom?: undefined;

  next?: undefined;
} & ( // not sent
    | {
        ok?: undefined;
      }
    // sent
    | {
        ok: true;
      }
  );

export type CaseStateReceiver<T> = CaseStateCommon & {
  // where to receive values
  recv: Receiver<T>;
  // sets values into the case state (generated by the select instance)
  rcb: ReceiverCallback<T>;
  // indicates if rcb has been added to the receiver
  hrcb: boolean;

  send?: undefined;
  scb?: undefined;
  hscb?: undefined;

  prom?: undefined;
} & ( // not received
    | {
        next?: undefined;
        ok?: undefined;
      }
    // received, not eof
    | {
        next: T;
        ok: true;
      }
    // received, eof (next will be default value, but only if supported by the receiver)
    | {
        next?: T;
        ok: false;
      }
  );

export type CaseStatePromise<T> = CaseStateCommon & {
  // original promise/value, wrapped (with catch) to propagate the result
  prom: Promise<void>;

  send?: undefined;
  scb?: undefined;
  hscb?: undefined;

  recv?: undefined;
  rcb?: undefined;
  hrcb?: undefined;
} & ( // not settled
    | {
        next?: undefined;
        ok?: undefined;
      }
    // settled, resolved
    | {
        next: T;
        ok: true;
      }
    // settled, rejected (next is the reason)
    | {
        next: unknown;
        ok: false;
      }
  );

export type CaseStateCommon = PromiseLike<number> & {
  // index in input cases array
  cidx: number;
  // index in the pending cases array
  pidx?: number;
};

/**
 * Prepares a {@link SelectCaseReceiver} case, to be used in a {@link Select}.
 *
 * WARNING: Cases may only be used in a single select instance, though select
 * instances are intended to be reused, e.g. when implementing control loops.
 */
export const recv = <T>(
  from: Receivable<T> | Receiver<T>
): SelectCaseReceiver<T> => ({
  [selectState]: {
    recv:
      getReceiver in from && from[getReceiver]
        ? from[getReceiver]()
        : (from as Receiver<T>),
    hrcb: false,

    // set later

    cidx: undefined as any,
    rcb: undefined as any,
    then: undefined as any,
  },
});

/**
 * Prepares a {@link SelectCaseSender} case, to be used in a {@link Select}.
 *
 * WARNING: Cases may only be used in a single select instance, though select
 * instances are intended to be reused, e.g. when implementing control loops.
 */
export const send = <T>(
  to: Sendable<T> | Sender<T>,
  scb: SenderCallback<T>
): SelectCaseSender<T> => ({
  [selectState]: {
    send:
      getSender in to && to[getSender] ? to[getSender]() : (to as Sender<T>),
    hscb: false,

    // set later

    cidx: undefined as any,
    scb,
    then: undefined as any,
  },
});
