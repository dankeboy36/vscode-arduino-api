[**vscode-arduino-api**](../README.md)

---

# Interface: Port

CLI port with optional `hardwareId` and `properties` to match boards-list.

## See

- [CliPort](../type-aliases/CliPort.md)
- [Arduino CLI Port](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.Port)

## Properties

### address

> **address**: `string`

Address of the port (e.g., `/dev/ttyACM0`).

---

### hardwareId?

> `optional` **hardwareId**: `string`

The hardware ID (serial number) of the board attached to the port.

---

### label

> **label**: `string`

The port label to show on the GUI (e.g. "ttyACM0").

---

### properties?

> `optional` **properties**: `object`

A set of properties of the port.

#### Index Signature

\[`key`: `string`\]: `string`

---

### protocol

> **protocol**: `string`

Protocol of the port (e.g., `serial`, `network`, ...).

---

### protocolLabel?

> `optional` **protocolLabel**: `string`

A human friendly description of the protocol (e.g., "Serial Port (USB)").
