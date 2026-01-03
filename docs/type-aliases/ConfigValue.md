[**vscode-arduino-api**](../README.md)

---

# Type Alias: ConfigValue

> **ConfigValue** = `object`

## Methods

### create()

> **create**(`base?`): `ConfigValue`

#### Parameters

##### base?

###### selected?

`boolean`

Whether the configuration option is selected.

###### value?

`string`

The configuration option value.

###### valueLabel?

`string`

Label to identify the configuration option to humans.

#### Returns

`ConfigValue`

---

### decode()

> **decode**(`input`, `length?`): `ConfigValue`

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

`ConfigValue`

---

### encode()

> **encode**(`message`, `writer?`): `Writer`

#### Parameters

##### message

`ConfigValue`

##### writer?

`Writer`

#### Returns

`Writer`

---

### fromJSON()

> **fromJSON**(`object`): `ConfigValue`

#### Parameters

##### object

`any`

#### Returns

`ConfigValue`

---

### fromPartial()

> **fromPartial**(`object`): `ConfigValue`

#### Parameters

##### object

###### selected?

`boolean`

Whether the configuration option is selected.

###### value?

`string`

The configuration option value.

###### valueLabel?

`string`

Label to identify the configuration option to humans.

#### Returns

`ConfigValue`

---

### toJSON()

> **toJSON**(`message`): `unknown`

#### Parameters

##### message

`ConfigValue`

#### Returns

`unknown`
