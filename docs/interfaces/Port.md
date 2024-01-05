# Interface: Port

Port represents a board port that may be used to upload or to monitor a board

## Table of contents

### Properties

- [address](Port.md#address)
- [hardwareId](Port.md#hardwareid)
- [label](Port.md#label)
- [properties](Port.md#properties)
- [protocol](Port.md#protocol)
- [protocolLabel](Port.md#protocollabel)

## Properties

### address

• **address**: `string`

Address of the port (e.g., `/dev/ttyACM0`).

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/port.d.ts:5

---

### hardwareId

• **hardwareId**: `string`

The hardware ID (serial number) of the board attached to the port

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/port.d.ts:17

---

### label

• **label**: `string`

The port label to show on the GUI (e.g. "ttyACM0")

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/port.d.ts:7

---

### properties

• **properties**: `Object`

A set of properties of the port

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/port.d.ts:13

---

### protocol

• **protocol**: `string`

Protocol of the port (e.g., `serial`, `network`, ...).

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/port.d.ts:9

---

### protocolLabel

• **protocolLabel**: `string`

A human friendly description of the protocol (e.g., "Serial Port (USB)").

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/port.d.ts:11
