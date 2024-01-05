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

---

### hardwareId

• **hardwareId**: `string`

The hardware ID (serial number) of the board attached to the port

---

### label

• **label**: `string`

The port label to show on the GUI (e.g. "ttyACM0")

---

### properties

• **properties**: `Object`

A set of properties of the port

#### Index signature

▪ [key: `string`]: `string`

---

### protocol

• **protocol**: `string`

Protocol of the port (e.g., `serial`, `network`, ...).

---

### protocolLabel

• **protocolLabel**: `string`

A human friendly description of the protocol (e.g., "Serial Port (USB)").
