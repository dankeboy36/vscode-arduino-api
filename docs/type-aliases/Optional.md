[**vscode-arduino-api**](../README.md)

---

# Type Alias: Optional\<T, K\>

> **Optional**\<`T`, `K`\> = `Omit`\<`T`, `K`\> & `Partial`\<`Pick`\<`T`, `K`\>\>

Makes a subset of keys optional while keeping the rest unchanged.

Example: `Optional<Foo, 'bar' | 'baz'>` makes `bar` and `baz` optional.

## Type Parameters

### T

`T`

### K

`K` _extends_ keyof `T`
