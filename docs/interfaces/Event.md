# Interface: Event\<T\>

Represents a typed event.

A function that represents an event to which you subscribe by calling it with
a listener function as argument.

**`Example`**

```ts
item.onDidChange(function (event) {
  console.log('Event happened: ' + event);
});
```

## Type parameters

| Name |
| :--- |
| `T`  |

## Callable

### Event

▸ **Event**(`listener`, `thisArgs?`, `disposables?`): [`Disposable`](../classes/Disposable.md)

A function that represents an event to which you subscribe by calling it with
a listener function as argument.

#### Parameters

| Name           | Type                                       | Description                                                               |
| :------------- | :----------------------------------------- | :------------------------------------------------------------------------ |
| `listener`     | (`e`: `T`) => `any`                        | The listener function will be called when the event happens.              |
| `thisArgs?`    | `any`                                      | The `this`-argument which will be used when calling the event listener.   |
| `disposables?` | [`Disposable`](../classes/Disposable.md)[] | An array to which a [Disposable](../classes/Disposable.md) will be added. |

#### Returns

[`Disposable`](../classes/Disposable.md)

A disposable which unsubscribes the event listener.

#### Defined in

node_modules/@types/vscode/index.d.ts:1606
