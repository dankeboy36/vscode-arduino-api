[**vscode-arduino-api**](../README.md)

---

# Type Alias: Programmer

> **Programmer** = `object`

## Methods

### create()

> **create**(`base?`): `Programmer`

#### Parameters

##### base?

###### id?

`string`

Programmer ID.

###### name?

`string`

Programmer name.

###### platform?

`string`

Platform name.

#### Returns

`Programmer`

---

### decode()

> **decode**(`input`, `length?`): `Programmer`

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

`Programmer`

---

### encode()

> **encode**(`message`, `writer?`): `Writer`

#### Parameters

##### message

`Programmer`

##### writer?

`Writer`

#### Returns

`Writer`

---

### fromJSON()

> **fromJSON**(`object`): `Programmer`

#### Parameters

##### object

`any`

#### Returns

`Programmer`

---

### fromPartial()

> **fromPartial**(`object`): `Programmer`

#### Parameters

##### object

###### id?

`string`

Programmer ID.

###### name?

`string`

Programmer name.

###### platform?

`string`

Platform name.

#### Returns

`Programmer`

---

### toJSON()

> **toJSON**(`message`): `unknown`

#### Parameters

##### message

`Programmer`

#### Returns

`unknown`
