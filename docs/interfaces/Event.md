[**vscode-arduino-api**](../README.md)

---

# Interface: Event()\<T\>

Represents a typed event.

A function that represents an event to which you subscribe by calling it with
a listener function as argument.

## Example

```ts
item.onDidChange(function (event) {
  console.log('Event happened: ' + event)
})
```

## Type Parameters

### T

`T`

> **Event**(`listener`, `thisArgs?`, `disposables?`): [`Disposable`](Disposable.md)

A function that represents an event to which you subscribe by calling it with
a listener function as argument.

## Parameters

### listener

(`e`) => `any`

The listener function will be called when the event happens.

### thisArgs?

`any`

The `this`-argument which will be used when calling the event listener.

### disposables?

[`Disposable`](Disposable.md)[]

An array to which a [Disposable](Disposable.md) will be added.

## Returns

[`Disposable`](Disposable.md)

A disposable which unsubscribes the event listener.
