# js-chan

Concurrency primitives for TypeScript and JavaScript.

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

## Introduction

Concurrency in JavaScript, frankly, sucks.

This module is a concerted effort to provide concurrency primitives for
TypeScript/JavaScript which capture (as much of) the semantics of Go's
channels as possible, while still being idiomatic to the language.

I'll be iterating on this for a few weeks, in my spare time, with the goal of
a production-ready module, which can be used any JS environment, including
browsers.

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [SelectCase](#selectcase)
*   [recv](#recv)
    *   [Parameters](#parameters)
*   [send](#send)
    *   [Parameters](#parameters-1)
*   [Chan](#chan)
    *   [Parameters](#parameters-2)
    *   [concurrency](#concurrency)
    *   [trySend](#trysend)
        *   [Parameters](#parameters-3)
    *   [tryRecv](#tryrecv)
*   [Receiver](#receiver)
    *   [Properties](#properties)
    *   [addReceiver](#addreceiver)
    *   [removeReceiver](#removereceiver)
*   [ReceiverCallback](#receivercallback)
*   [Receivable](#receivable)
    *   [Properties](#properties-1)
*   [getReceiver](#getreceiver)
*   [Sender](#sender)
    *   [Properties](#properties-2)
    *   [addSender](#addsender)
    *   [removeSender](#removesender)
    *   [close](#close)
*   [SenderCallback](#sendercallback)
*   [Sendable](#sendable)
    *   [Properties](#properties-3)
*   [getSender](#getsender)
*   [SendOnClosedChannelError](#sendonclosedchannelerror)
    *   [Parameters](#parameters-4)
*   [CloseOfClosedChannelError](#closeofclosedchannelerror)
    *   [Parameters](#parameters-5)
*   [Select](#select)
    *   [Parameters](#parameters-6)
    *   [cases](#cases)
    *   [poll](#poll)
    *   [recv](#recv-1)
        *   [Parameters](#parameters-7)

### SelectCase

SelectCase models the state of a single case in a [Select](#select).
WARNING: The selectState symbol is deliberately not exported, as the
value of `SelectCase[selectState]` is not part of the API contract, and
is simply a mechanism to support typing.

Type: (SelectCaseSender\<T> | SelectCaseReceiver\<T> | SelectCasePromise\<T>)

### recv

Prepares a [SelectCaseReceiver](SelectCaseReceiver) case, to be used in a [Select](#select).

WARNING: Cases may only be used in a single select instance, though select
instances are intended to be reused, e.g. when implementing control loops.

#### Parameters

*   `from` **([Receivable](#receivable)\<T> | [Receiver](#receiver)\<T>)**&#x20;

Returns **SelectCaseReceiver\<T>**&#x20;

### send

Prepares a [SelectCaseSender](SelectCaseSender) case, to be used in a [Select](#select).

WARNING: Cases may only be used in a single select instance, though select
instances are intended to be reused, e.g. when implementing control loops.

#### Parameters

*   `to` **([Sendable](#sendable)\<T> | [Sender](#sender)\<T>)**&#x20;
*   `scb` **[SenderCallback](#sendercallback)\<T>**&#x20;

Returns **SelectCaseSender\<T>**&#x20;

### Chan

Provides a communication mechanism between two or more concurrent
operations.

#### Parameters

*   `capacity`   (optional, default `0`)
*   `newDefaultValue` **function (): T?**&#x20;

#### concurrency

Returns an integer representing the number of blocking operations.
Positive values indicate senders, while negative values indicate
receivers.

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;

#### trySend

Performs a synchronous send operation on the channel, returning true if
it succeeds, or false if there are no waiting receivers, and the channel
is full.

Will throw [SendOnClosedChannelError](#sendonclosedchannelerror) if the channel is closed.

##### Parameters

*   `value` **T**&#x20;

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**&#x20;

#### tryRecv

Like [trySend](trySend), this performs a synchronous recv operation on the
channel, returning undefined if no value is available, or an iterator
result, which models the received value, and whether the channel is open.

Returns **(IteratorResult\<T, (T | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))> | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))**&#x20;

### Receiver

Receiver allows callers to receive values.
It uses a one-off callback that models what is going to receive the value.

Unlike [Iterator](Iterator), it is not intended to support statefulness - a
[Receivable](#receivable) should return equivalent (but not necessarily identical)
[Receiver](#receiver) instances on each call to [getReceiver](#getreceiver).

Type: {addReceiver: function (callback: [ReceiverCallback](#receivercallback)\<T>): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), removeReceiver: function (callback: [ReceiverCallback](#receivercallback)\<T>): void}

#### Properties

*   `addReceiver` **function (callback: [ReceiverCallback](#receivercallback)\<T>): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**&#x20;
*   `removeReceiver` **function (callback: [ReceiverCallback](#receivercallback)\<T>): void**&#x20;

#### addReceiver

Add a receiver callback to a list of receivers, or call it immediately if
there is an available sender.
Returns true if the receiver was called added to the receiver list.
Returns false if the receiver was called immediately.

Type: function (callback: [ReceiverCallback](#receivercallback)\<T>): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

#### removeReceiver

Immediately removes the receiver from the receiver list, if it is there.

Type: function (callback: [ReceiverCallback](#receivercallback)\<T>): void

### ReceiverCallback

ReceiverCallback is a callback that receives a value from a sender and true,
or a default value (or undefined if unsupported), and false, if the channel
is closed.

Type: function (...(\[T, `true`] | \[(T | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined)), `false`])): void

### Receivable

Receivable is a value that can be converted to a [Receiver](#receiver).

Type: {getReceiver: function (): [Receiver](#receiver)\<T>}

#### Properties

*   `getReceiver` **function (): [Receiver](#receiver)\<T>**&#x20;

### getReceiver

See [Receivable](#receivable).

### Sender

Sender allows callers to send values.
It uses a one-off callback that models what is going to send the value.

Unlike [Iterator](Iterator), it is not intended to support statefulness - a
[Sendable](#sendable) should return equivalent (but not necessarily identical)
[Sender](#sender) instances on each call to [getSender](#getsender).

See also [SendOnClosedChannelError](#sendonclosedchannelerror), which SHOULD be raised on
[addSender](addSender) (if closed on add) or passed into send callbacks
(otherwise), when attempting to send on a closed channel.

Type: {addSender: function (callback: [SenderCallback](#sendercallback)\<T>): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean), removeSender: function (callback: [SenderCallback](#sendercallback)\<T>): void, close: function (): void?}

#### Properties

*   `addSender` **function (callback: [SenderCallback](#sendercallback)\<T>): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**&#x20;
*   `removeSender` **function (callback: [SenderCallback](#sendercallback)\<T>): void**&#x20;
*   `close` **function (): void?**&#x20;

#### addSender

Add a sender callback to a list of senders, or call it immediately if
there is an available receiver.
Returns true if the sender was added to the sender list.
Returns false if the sender was called immediately.
If the channel is closed, SHOULD throw [SendOnClosedChannelError](#sendonclosedchannelerror).
If the channel is closed while the sender is waiting to be called, the
sender SHOULD be called with [SendOnClosedChannelError](#sendonclosedchannelerror).

Type: function (callback: [SenderCallback](#sendercallback)\<T>): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

#### removeSender

Immediately removes the sender from the sender list, if it is there.

Type: function (callback: [SenderCallback](#sendercallback)\<T>): void

#### close

Closes the channel, adhering to the following semantics similar to Go's
channels:

*   Once a channel is closed, no more values can be sent to it.
*   If a channel is buffered, and there are still values in the buffer when
    the channel is closed, the receivers will continue to receive those
    values until the buffer is empty.
*   It's the responsibility of the sender to close the channel, signaling to
    the receiver that no more data will be sent.
*   Attempting to send to a closed channel MUST result in an error, and
    MUST un-block any such senders as part of said close.
*   The error thrown when attempting to send on a closed channel SHOULD be
    [SendOnClosedChannelError](#sendonclosedchannelerror), but MAY be another error.
*   Unless explicitly documented as idempotent, `close` SHOULD throw
    [CloseOfClosedChannelError](#closeofclosedchannelerror) on subsequent calls, but MAY throw
    other errors.
*   Channels should be closed to prevent potential deadlocks or to signal
    the end of data transmission. This ensures that receivers waiting on the
    channel don't do so indefinitely.

Note: This method is optional. Some [Sendable](#sendable) implementations may
specify their own rules and semantics for closing channels. Always refer
to the specific implementation's documentation to ensure correct usage and
to prevent potential memory leaks or unexpected behaviors.

See also [SendOnClosedChannelError](#sendonclosedchannelerror) and
[CloseOfClosedChannelError](#closeofclosedchannelerror).

Type: function (): void

### SenderCallback

SenderCallback is called as a value is received, or when an error or some
other event occurs, which prevents the value from being received.
It accepts two parameters, an error (if any), and the boolean `ok`,
indicating if the value has been (will be, after return) received.
It MUST return the value (or throw) if `ok` is true, and SHOULD throw
`err` if `ok` is false.

The `ok` parameter being true guarantees that a value (once returned) has
been received, though does not guarantee that anything will be done with it.

If the `ok` parameter is false, the first parameter will contain any error,
and no value (regardless of what is returned) will be received.

Note: The sender callback is *not* called on `removeSender`.

WARNING: If the same value (===) as err (when ok is false) is thrown, that
thrown error will not be bubbled - a mechanism used to avoid breaking the
typing of the return value.

Type: function (...(\[[undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined), `true`] | \[any, `false`])): T

### Sendable

Sendable is a value that can be converted to a [Sender](#sender).

Type: {getSender: function (): [Sender](#sender)\<T>}

#### Properties

*   `getSender` **function (): [Sender](#sender)\<T>**&#x20;

### getSender

See [Sendable](#sendable).

### SendOnClosedChannelError

**Extends Error**

Provided as a convenience, that SHOULD be used by [Sender](#sender)
implementations, to indicate that a channel is closed.
Should be raised as a result of send attempts on a closed channel, where
the send operation is not allowed to proceed.

#### Parameters

*   `args` **...ConstructorParameters\<any>**&#x20;

### CloseOfClosedChannelError

**Extends Error**

Provided as a convenience, that SHOULD be used by [Sender](#sender)
implementations, in the event that a channel close is attempted more than
once.

#### Parameters

*   `args` **...ConstructorParameters\<any>**&#x20;

### Select

Select implements the functionality of Go's select statement, with support
for support cases comprised of [Sender](#sender), [Receiver](#receiver), or values
(resolved as promises), which are treated as a single-value never-closed
channel.

#### Parameters

*   `cases` **T**&#x20;

#### cases

The cases for this select. When receiving a value, callers must provide
one of these, the index for which is determined by the return value of
either [poll](poll) or [wait](wait).

Type: SelectCases\<T>

Returns **SelectCases\<T>**&#x20;

#### poll

Poll returns the next case that is ready, or undefined if none are
ready. It must not be called concurrently with [wait](wait) or
[recv](#recv).
This is effectively a non-blocking version of [wait](wait), and fills the
same role as the `default` select case, in Go's select statement.

Returns **([number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))**&#x20;

#### recv

Consume the result of a ready case.

##### Parameters

*   `v` **[SelectCase](#selectcase)\<T>**&#x20;

Returns **IteratorResult\<T, (T | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))>**&#x20;
