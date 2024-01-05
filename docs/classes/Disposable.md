# Class: Disposable

Represents a type which can release resources, such
as event listening or a timer.

## Table of contents

### Constructors

- [constructor](Disposable.md#constructor)

### Methods

- [dispose](Disposable.md#dispose)
- [from](Disposable.md#from)

## Constructors

### constructor

• **new Disposable**(`callOnDispose`): [`Disposable`](Disposable.md)

Creates a new disposable that calls the provided function
on dispose.

_Note_ that an asynchronous function is not awaited.

#### Parameters

| Name            | Type        | Description                       |
| :-------------- | :---------- | :-------------------------------- |
| `callOnDispose` | () => `any` | Function that disposes something. |

#### Returns

[`Disposable`](Disposable.md)

## Methods

### dispose

▸ **dispose**(): `any`

Dispose this object.

#### Returns

`any`

---

### from

▸ **from**(`...disposableLikes`): [`Disposable`](Disposable.md)

Combine many disposable-likes into one. You can use this method when having objects with
a dispose function which aren't instances of `Disposable`.

#### Parameters

| Name                 | Type                          | Description                                                                                                      |
| :------------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `...disposableLikes` | \{ `dispose`: () => `any` }[] | Objects that have at least a `dispose`-function member. Note that asynchronous dispose-functions aren't awaited. |

#### Returns

[`Disposable`](Disposable.md)

Returns a new disposable which, upon dispose, will
dispose all provided disposables.
