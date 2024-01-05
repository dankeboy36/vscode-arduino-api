# Interface: ChangeEvent\<T\>

Describes a change event with the new state of the `object` and an array indicating which property has changed.

## Type parameters

| Name |
| :--- |
| `T`  |

## Table of contents

### Properties

- [changedProperties](ChangeEvent.md#changedproperties)
- [object](ChangeEvent.md#object)

## Properties

### changedProperties

• `Readonly` **changedProperties**: readonly keyof `T`[]

An array properties that have changed in the `object`.

#### Defined in

[src/api.ts:202](https://github.com/dankeboy36/vscode-arduino-api/blob/0badc9d/src/api.ts#L202)

---

### object

• `Readonly` **object**: `T`

The new state of the object

#### Defined in

[src/api.ts:198](https://github.com/dankeboy36/vscode-arduino-api/blob/0badc9d/src/api.ts#L198)
