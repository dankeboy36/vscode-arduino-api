[**vscode-arduino-api**](../README.md)

---

# Type Alias: ConfigOption

> **ConfigOption** = `object`

## Methods

### create()

> **create**(`base?`): `ConfigOption`

#### Parameters

##### base?

###### option?

`string`

ID of the configuration option. For identifying the option to machines.

###### optionLabel?

`string`

Name of the configuration option for identifying the option to humans.

###### values?

`object`[]

Possible values of the configuration option.

#### Returns

`ConfigOption`

---

### decode()

> **decode**(`input`, `length?`): `ConfigOption`

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

`ConfigOption`

---

### encode()

> **encode**(`message`, `writer?`): `Writer`

#### Parameters

##### message

`ConfigOption`

##### writer?

`Writer`

#### Returns

`Writer`

---

### fromJSON()

> **fromJSON**(`object`): `ConfigOption`

#### Parameters

##### object

`any`

#### Returns

`ConfigOption`

---

### fromPartial()

> **fromPartial**(`object`): `ConfigOption`

#### Parameters

##### object

###### option?

`string`

ID of the configuration option. For identifying the option to machines.

###### optionLabel?

`string`

Name of the configuration option for identifying the option to humans.

###### values?

`object`[]

Possible values of the configuration option.

#### Returns

`ConfigOption`

---

### toJSON()

> **toJSON**(`message`): `unknown`

#### Parameters

##### message

`ConfigOption`

#### Returns

`unknown`
