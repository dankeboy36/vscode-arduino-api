[**vscode-arduino-api**](../README.md)

---

# Interface: ArduinoState

The current state of the Arduino IDE.

## Extended by

- [`ArduinoContext`](ArduinoContext.md)

## Properties

### ~~boardDetails~~

> `readonly` **boardDetails**: [`BoardDetails`](BoardDetails.md) \| `undefined`

Lightweight representation of the board's detail. This information is
[provided by the Arduino
CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse)
for the currently selected board. It can be `undefined` if the `fqbn` is
defined but the platform is not installed.

#### Deprecated

Use `arduinoContext?.currentSketch?.boardDetails` instead.

---

### ~~compileSummary~~

> `readonly` **compileSummary**: [`CompileSummary`](CompileSummary.md) \| `undefined`

The summary of the latest sketch compilation. When the `sketchPath` is
available but the sketch has not been verified (compiled), the `buildPath`
can be `undefined`.

#### Deprecated

Use `arduinoContext?.currentSketch?.compileSummary` instead.

---

### ~~dataDirPath~~

> `readonly` **dataDirPath**: `string` \| `undefined`

Filesystem path to the
[`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
location.

#### Deprecated

Use `arduinoContext?.config?.dataDirPath` instead.

---

### ~~fqbn~~

> `readonly` **fqbn**: `string` \| `undefined`

The Fully Qualified Board Name (FQBN) of the currently selected board in
the Arduino IDE.

#### Deprecated

Use `arduinoContext?.currentSketch?.board?.fqbn` instead.

---

### ~~port~~

> `readonly` **port**: [`Port`](Port.md) \| `undefined`

The currently selected port in the Arduino IDE.

#### Deprecated

Use `arduinoContext?.currentSketch?.port` instead.

---

### ~~sketchPath~~

> `readonly` **sketchPath**: `string` \| `undefined`

Absolute filesystem path of the sketch folder.

#### Deprecated

Use `arduinoContext?.currentSketch?.sketchPath` instead.

---

### ~~userDirPath~~

> `readonly` **userDirPath**: `string` \| `undefined`

Filesystem path to the
[`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
location. This is the sketchbook path.

#### Deprecated

Use `arduinoContext?.config?.userDirPath` instead.
