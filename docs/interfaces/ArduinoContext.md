# Interface: ArduinoContext

Provides access to the current state of the Arduino IDE such as the sketch path, the currently selected board, and port, and etc.

## Hierarchy

- [`ArduinoState`](ArduinoState.md)

  ↳ **`ArduinoContext`**

## Table of contents

### Properties

- [boardDetails](ArduinoContext.md#boarddetails)
- [compileSummary](ArduinoContext.md#compilesummary)
- [config](ArduinoContext.md#config)
- [currentSketch](ArduinoContext.md#currentsketch)
- [dataDirPath](ArduinoContext.md#datadirpath)
- [fqbn](ArduinoContext.md#fqbn)
- [onDidChangeConfig](ArduinoContext.md#ondidchangeconfig)
- [onDidChangeCurrentSketch](ArduinoContext.md#ondidchangecurrentsketch)
- [onDidChangeSketch](ArduinoContext.md#ondidchangesketch)
- [onDidChangeSketchFolders](ArduinoContext.md#ondidchangesketchfolders)
- [openedSketches](ArduinoContext.md#openedsketches)
- [port](ArduinoContext.md#port)
- [sketchPath](ArduinoContext.md#sketchpath)
- [userDirPath](ArduinoContext.md#userdirpath)

### Methods

- [onDidChange](ArduinoContext.md#ondidchange)

## Properties

### boardDetails

• `Readonly` **boardDetails**: `undefined` \| [`BoardDetails`](BoardDetails.md)

Lightweight representation of the board's detail. This information is [provided by the Arduino CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the currently selected board. It can be `undefined` if the `fqbn` is defined but the platform is not installed.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.boardDetails` instead.

#### Inherited from

[ArduinoState](ArduinoState.md).[boardDetails](ArduinoState.md#boarddetails)

---

### compileSummary

• `Readonly` **compileSummary**: `undefined` \| [`CompileSummary`](CompileSummary.md)

The summary of the latest sketch compilation. When the `sketchPath` is available but the sketch has not been verified (compiled), the `buildPath` can be `undefined`.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.compileSummary` instead.

#### Inherited from

[ArduinoState](ArduinoState.md).[compileSummary](ArduinoState.md#compilesummary)

---

### config

• `Readonly` **config**: [`CliConfig`](CliConfig.md)

The currently configured Arduino CLI configuration.

---

### currentSketch

• `Readonly` **currentSketch**: `undefined` \| [`SketchFolder`](SketchFolder.md)

The currently active sketch (folder) or `undefined`. The current sketch is the one that currently has focus or most recently had focus.
The current sketch is in the [opened sketches](ArduinoContext.md#openedsketches).

---

### dataDirPath

• `Readonly` **dataDirPath**: `undefined` \| `string`

Filesystem path to the [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location.

**`Deprecated`**

Use `arduinoContext?.config?.dataDirPath` instead.

#### Inherited from

[ArduinoState](ArduinoState.md).[dataDirPath](ArduinoState.md#datadirpath)

---

### fqbn

• `Readonly` **fqbn**: `undefined` \| `string`

The Fully Qualified Board Name (FQBN) of the currently selected board in the Arduino IDE.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.board?.fqbn` instead.

#### Inherited from

[ArduinoState](ArduinoState.md).[fqbn](ArduinoState.md#fqbn)

---

### onDidChangeConfig

• `Readonly` **onDidChangeConfig**: [`Event`](Event.md)\<[`ChangeEvent`](ChangeEvent.md)\<[`CliConfig`](CliConfig.md)\>\>

An event that is emitter when the [sketchbook](CliConfig.md#userdirpath) (`directories.data`) or the [data directory](CliConfig.md#datadirpath) (`directories.data`) path has changed.

---

### onDidChangeCurrentSketch

• `Readonly` **onDidChangeCurrentSketch**: [`Event`](Event.md)\<`undefined` \| [`SketchFolder`](SketchFolder.md)\>

An [Event](Event.md) that is emitted when the [current sketch](ArduinoContext.md#currentsketch) has changed.
_Note_ that the event also fires when the active editor changes to `undefined`.

---

### onDidChangeSketch

• `Readonly` **onDidChangeSketch**: [`Event`](Event.md)\<[`ChangeEvent`](ChangeEvent.md)\<[`SketchFolder`](SketchFolder.md)\>\>

An event that is emitted when the selected [board](SketchFolder.md#board), [port](SketchFolder.md#port), etc., has changed in the [sketch folder](SketchFolder.md).

---

### onDidChangeSketchFolders

• `Readonly` **onDidChangeSketchFolders**: [`Event`](Event.md)\<[`SketchFoldersChangeEvent`](SketchFoldersChangeEvent.md)\>

An event that is emitted when sketch folders are added or removed.

---

### openedSketches

• `Readonly` **openedSketches**: readonly [`SketchFolder`](SketchFolder.md)[]

All opened sketch folders in the window.

---

### port

• `Readonly` **port**: `undefined` \| [`Port`](Port.md)

The currently selected port in the Arduino IDE.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.port` instead.

#### Inherited from

[ArduinoState](ArduinoState.md).[port](ArduinoState.md#port)

---

### sketchPath

• `Readonly` **sketchPath**: `undefined` \| `string`

Absolute filesystem path of the sketch folder.

**`Deprecated`**

Use `arduinoContext?.currentSketch?.sketchPath` instead.

#### Inherited from

[ArduinoState](ArduinoState.md).[sketchPath](ArduinoState.md#sketchpath)

---

### userDirPath

• `Readonly` **userDirPath**: `undefined` \| `string`

Filesystem path to the [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location. This is the sketchbook path.

**`Deprecated`**

Use `arduinoContext?.config?.userDirPath` instead.

#### Inherited from

[ArduinoState](ArduinoState.md).[userDirPath](ArduinoState.md#userdirpath)

## Methods

### onDidChange

▸ **onDidChange**\<`T`\>(`property`): [`Event`](Event.md)\<[`ArduinoState`](ArduinoState.md)[`T`]\>

#### Type parameters

| Name | Type                                            |
| :--- | :---------------------------------------------- |
| `T`  | extends keyof [`ArduinoState`](ArduinoState.md) |

#### Parameters

| Name       | Type |
| :--------- | :--- |
| `property` | `T`  |

#### Returns

[`Event`](Event.md)\<[`ArduinoState`](ArduinoState.md)[`T`]\>

**`Deprecated`**

Use `onDidChangeSketch` and `onDidChangeConfig` instead.
