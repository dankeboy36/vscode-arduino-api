[**vscode-arduino-api**](../README.md)

---

# Interface: Port

Port represents a board port that may be used to upload or to monitor a board.

## Properties

### address

> **address**: `string`

Address of the port (e.g., `/dev/ttyACM0`).

---

### hardwareId

> **hardwareId**: `string`

The hardware ID (serial number) of the board attached to the port.

---

### label

> **label**: `string`

The port label to show on the GUI (e.g. "ttyACM0").

---

### properties

> **properties**: `object`

A set of properties of the port.

#### Index Signature

\[`key`: `string`\]: `string`

---

### protocol

> **protocol**: `string`

Protocol of the port (e.g., `serial`, `network`, ...).

---

### protocolLabel

> **protocolLabel**: `string`

A human friendly description of the protocol (e.g., "Serial Port (USB)").
