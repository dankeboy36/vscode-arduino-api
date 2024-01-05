# Interface: ArduinoState

The current state of the Arduino IDE.

## Hierarchy

- **`ArduinoState`**

  ↳ [`ArduinoContext`](ArduinoContext.md)

## Table of contents

### Properties

- [boardDetails](ArduinoState.md#boarddetails)
- [compileSummary](ArduinoState.md#compilesummary)
- [dataDirPath](ArduinoState.md#datadirpath)
- [fqbn](ArduinoState.md#fqbn)
- [port](ArduinoState.md#port)
- [sketchPath](ArduinoState.md#sketchpath)
- [userDirPath](ArduinoState.md#userdirpath)

## Properties

### boardDetails

• `Readonly` **boardDetails**: `undefined` \| [`BoardDetails`](BoardDetails.md)

Lightweight representation of the board's detail. This information is [provided by the Arduino CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the currently selected board. It can be `undefined` if the `fqbn` is defined but the platform is not installed.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.boardDetails` instead.

---

### compileSummary

• `Readonly` **compileSummary**: `undefined` \| [`CompileSummary`](CompileSummary.md)

The summary of the latest sketch compilation. When the `sketchPath` is available but the sketch has not been verified (compiled), the `buildPath` can be `undefined`.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.compileSummary` instead.

---

### dataDirPath

• `Readonly` **dataDirPath**: `undefined` \| `string`

Filesystem path to the [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location.

**`Deprecated`**

Use `arduinoContext?.config?.dataDirPath` instead.

---

### fqbn

• `Readonly` **fqbn**: `undefined` \| `string`

The Fully Qualified Board Name (FQBN) of the currently selected board in the Arduino IDE.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.board?.fqbn` instead.

---

### port

• `Readonly` **port**: `undefined` \| [`Port`](Port.md)

The currently selected port in the Arduino IDE.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.port` instead.

---

### sketchPath

• `Readonly` **sketchPath**: `undefined` \| `string`

Absolute filesystem path of the sketch folder.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.sketchPath` instead.

---

### userDirPath

• `Readonly` **userDirPath**: `undefined` \| `string`

Filesystem path to the [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location. This is the sketchbook path.

**`Deprecated`**

Use `arduinoContext?.config?.userDirPath` instead.
