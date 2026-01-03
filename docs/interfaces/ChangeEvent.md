[**vscode-arduino-api**](../README.md)

---

# Interface: ChangeEvent\<T\>

Describes a change event with the new state of the `object` and an array
indicating which property has changed.

## Type Parameters

### T

`T`

## Properties

### changedProperties

> `readonly` **changedProperties**: readonly keyof `T`[]

An array properties that have changed in the `object`.

---

### object

> `readonly` **object**: `T`

The new state of the object
