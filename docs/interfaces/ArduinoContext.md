[**vscode-arduino-api**](../README.md)

---

# Interface: ArduinoContext

Provides access to the current state of the Arduino IDE such as the sketch
path, the currently selected board, and port, and etc.

## Extends

- [`ArduinoState`](ArduinoState.md)

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

#### Inherited from

[`ArduinoState`](ArduinoState.md).[`boardDetails`](ArduinoState.md#boarddetails)

---

### ~~compileSummary~~

> `readonly` **compileSummary**: [`CompileSummary`](CompileSummary.md) \| `undefined`

The summary of the latest sketch compilation. When the `sketchPath` is
available but the sketch has not been verified (compiled), the `buildPath`
can be `undefined`.

#### Deprecated

Use `arduinoContext?.currentSketch?.compileSummary` instead.

#### Inherited from

[`ArduinoState`](ArduinoState.md).[`compileSummary`](ArduinoState.md#compilesummary)

---

### config

> `readonly` **config**: [`CliConfig`](CliConfig.md)

The currently configured Arduino CLI configuration.

---

### currentSketch

> `readonly` **currentSketch**: [`SketchFolder`](SketchFolder.md) \| `undefined`

The currently active sketch (folder) or `undefined`. The current sketch is
the one that currently has focus or most recently had focus. The current
sketch is in the [opened sketches](#openedsketches).

---

### ~~dataDirPath~~

> `readonly` **dataDirPath**: `string` \| `undefined`

Filesystem path to the
[`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
location.

#### Deprecated

Use `arduinoContext?.config?.dataDirPath` instead.

#### Inherited from

[`ArduinoState`](ArduinoState.md).[`dataDirPath`](ArduinoState.md#datadirpath)

---

### ~~fqbn~~

> `readonly` **fqbn**: `string` \| `undefined`

The Fully Qualified Board Name (FQBN) of the currently selected board in
the Arduino IDE.

#### Deprecated

Use `arduinoContext?.currentSketch?.board?.fqbn` instead.

#### Inherited from

[`ArduinoState`](ArduinoState.md).[`fqbn`](ArduinoState.md#fqbn)

---

### onDidChangeConfig

> `readonly` **onDidChangeConfig**: [`Event`](Event.md)\<[`ChangeEvent`](ChangeEvent.md)\<[`CliConfig`](CliConfig.md)\>\>

An event that is emitter when the [sketchbook](CliConfig.md#userdirpath)
(`directories.data`) or the [data directory](CliConfig.md#datadirpath)
(`directories.data`) path has changed.

---

### onDidChangeCurrentSketch

> `readonly` **onDidChangeCurrentSketch**: [`Event`](Event.md)\<[`SketchFolder`](SketchFolder.md) \| `undefined`\>

An [Event](Event.md) that is emitted when the
[current sketch](#currentsketch) has changed. _Note_ that the event also
fires when the active editor changes to `undefined`.

---

### onDidChangeSketch

> `readonly` **onDidChangeSketch**: [`Event`](Event.md)\<[`ChangeEvent`](ChangeEvent.md)\<[`SketchFolder`](SketchFolder.md)\>\>

An event that is emitted when the selected [board](SketchFolder.md#board),
[port](SketchFolder.md#port), etc., has changed in the
[sketch folder](SketchFolder.md).

---

### onDidChangeSketchFolders

> `readonly` **onDidChangeSketchFolders**: [`Event`](Event.md)\<[`SketchFoldersChangeEvent`](SketchFoldersChangeEvent.md)\>

An event that is emitted when sketch folders are added or removed.

---

### openedSketches

> `readonly` **openedSketches**: readonly [`SketchFolder`](SketchFolder.md)[]

All opened sketch folders in the window.

---

### ~~port~~

> `readonly` **port**: [`Port`](Port.md) \| `undefined`

The currently selected port in the Arduino IDE.

#### Deprecated

Use `arduinoContext?.currentSketch?.port` instead.

#### Inherited from

[`ArduinoState`](ArduinoState.md).[`port`](ArduinoState.md#port)

---

### ~~sketchPath~~

> `readonly` **sketchPath**: `string` \| `undefined`

Absolute filesystem path of the sketch folder.

#### Deprecated

Use `arduinoContext?.currentSketch?.sketchPath` instead.

#### Inherited from

[`ArduinoState`](ArduinoState.md).[`sketchPath`](ArduinoState.md#sketchpath)

---

### ~~userDirPath~~

> `readonly` **userDirPath**: `string` \| `undefined`

Filesystem path to the
[`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
location. This is the sketchbook path.

#### Deprecated

Use `arduinoContext?.config?.userDirPath` instead.

#### Inherited from

[`ArduinoState`](ArduinoState.md).[`userDirPath`](ArduinoState.md#userdirpath)

## Methods

### ~~onDidChange()~~

> **onDidChange**\<`T`\>(`property`): [`Event`](Event.md)\<[`ArduinoState`](ArduinoState.md)\[`T`\]\>

#### Type Parameters

##### T

`T` _extends_ keyof [`ArduinoState`](ArduinoState.md)

#### Parameters

##### property

`T`

#### Returns

[`Event`](Event.md)\<[`ArduinoState`](ArduinoState.md)\[`T`\]\>

#### Deprecated

Use `onDidChangeSketch` and `onDidChangeConfig` instead.
