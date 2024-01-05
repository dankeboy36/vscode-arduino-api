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

---

### object

• `Readonly` **object**: `T`

The new state of the object
