[**vscode-arduino-api**](../README.md)

---

# Interface: Port

## Extends

- `Port`

## Properties

### address

> **address**: `string`

Address of the port (e.g., `/dev/ttyACM0`).

#### Inherited from

`CliPort.address`

---

### hardwareId

> **hardwareId**: `string`

The hardware ID (serial number) of the board attached to the port.

#### Inherited from

`CliPort.hardwareId`

---

### label

> **label**: `string`

The port label to show on the GUI (e.g. "ttyACM0").

#### Inherited from

`CliPort.label`

---

### properties

> **properties**: `object`

A set of properties of the port.

#### Index Signature

\[`key`: `string`\]: `string`

#### Inherited from

`CliPort.properties`

---

### protocol

> **protocol**: `string`

Protocol of the port (e.g., `serial`, `network`, ...).

#### Inherited from

`CliPort.protocol`

---

### protocolLabel

> **protocolLabel**: `string`

A human friendly description of the protocol (e.g., "Serial Port (USB)").

#### Inherited from

`CliPort.protocolLabel`
