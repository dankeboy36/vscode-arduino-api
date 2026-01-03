[**vscode-arduino-api**](../README.md)

---

# Type Alias: Port

> **Port** = `object`

## Methods

### create()

> **create**(`base?`): `Port`

#### Parameters

##### base?

###### address?

`string`

Address of the port (e.g., `/dev/ttyACM0`).

###### hardwareId?

`string`

The hardware ID (serial number) of the board attached to the port.

###### label?

`string`

The port label to show on the GUI (e.g. "ttyACM0").

###### properties?

\{\[`key`: `string`\]: `string` \| `undefined`; \}

A set of properties of the port.

###### protocol?

`string`

Protocol of the port (e.g., `serial`, `network`, ...).

###### protocolLabel?

`string`

A human friendly description of the protocol (e.g., "Serial Port (USB)").

#### Returns

`Port`

---

### decode()

> **decode**(`input`, `length?`): `Port`

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

`Port`

---

### encode()

> **encode**(`message`, `writer?`): `Writer`

#### Parameters

##### message

`Port`

##### writer?

`Writer`

#### Returns

`Writer`

---

### fromJSON()

> **fromJSON**(`object`): `Port`

#### Parameters

##### object

`any`

#### Returns

`Port`

---

### fromPartial()

> **fromPartial**(`object`): `Port`

#### Parameters

##### object

###### address?

`string`

Address of the port (e.g., `/dev/ttyACM0`).

###### hardwareId?

`string`

The hardware ID (serial number) of the board attached to the port.

###### label?

`string`

The port label to show on the GUI (e.g. "ttyACM0").

###### properties?

\{\[`key`: `string`\]: `string` \| `undefined`; \}

A set of properties of the port.

###### protocol?

`string`

Protocol of the port (e.g., `serial`, `network`, ...).

###### protocolLabel?

`string`

A human friendly description of the protocol (e.g., "Serial Port (USB)").

#### Returns

`Port`

---

### toJSON()

> **toJSON**(`message`): `unknown`

#### Parameters

##### message

`Port`

#### Returns

`unknown`
