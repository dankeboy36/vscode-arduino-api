# vscode-arduino-api

## Table of contents

### Classes

- [Disposable](classes/Disposable.md)

### Interfaces

- [ArduinoContext](interfaces/ArduinoContext.md)
- [ArduinoState](interfaces/ArduinoState.md)
- [BoardDetails](interfaces/BoardDetails.md)
- [ChangeEvent](interfaces/ChangeEvent.md)
- [CliConfig](interfaces/CliConfig.md)
- [CompileSummary](interfaces/CompileSummary.md)
- [ConfigOption](interfaces/ConfigOption.md)
- [ConfigValue](interfaces/ConfigValue.md)
- [Event](interfaces/Event.md)
- [Port](interfaces/Port.md)
- [Programmer](interfaces/Programmer.md)
- [SketchFolder](interfaces/SketchFolder.md)
- [SketchFoldersChangeEvent](interfaces/SketchFoldersChangeEvent.md)

### Type Aliases

- [BoardIdentifier](README.md#boardidentifier)
- [BuildProperties](README.md#buildproperties)
- [Tool](README.md#tool)
- [Version](README.md#version)

### Variables

- [ConfigOption](README.md#configoption)
- [ConfigValue](README.md#configvalue)
- [Port](README.md#port)
- [Programmer](README.md#programmer)

## Type Aliases

### BoardIdentifier

Ƭ **BoardIdentifier**: `Nullable`\<`ApiBoard`, `"fqbn"`\>

Lightweight information to identify a board:

- The board's `name` is to provide a fallback for the UI. Preferably do not use this property for any sophisticated logic and board comparison. It must never participate in the board's identification.
- The FQBN might contain boards config options if selected from the discovered ports (see [arduino/arduino-ide#1588](https://github.com/arduino/arduino-ide/issues/1588)).

---

### BuildProperties

Ƭ **BuildProperties**: `Readonly`\<`Record`\<`string`, `string`\>\>

Build properties used for compiling. The board-specific properties are retrieved from `board.txt` and `platform.txt`. For example, if the `board.txt` contains the `build.tarch=xtensa` entry for the `esp32:esp32:esp32` board, the record includes the `"build.tarch": "xtensa"` property.

---

### Tool

Ƭ **Tool**: `Readonly`\<`Pick`\<`ToolsDependencies`, `"name"` \| `"version"` \| `"packager"`\>\>

Required Tool dependencies of a board. See [`ToolsDependencies`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.ToolsDependencies) for the CLI API.

---

### Version

Ƭ **Version**: `string`

Supposed to be a [SemVer](https://semver.org/) as a `string` but it's not enforced by Arduino. You might need to coerce the SemVer string.

## Variables

### ConfigOption

• **ConfigOption**: `Object`

#### Type declaration

| Name          | Type                                                                                                                                                                                                      |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`      | (`base?`: \{ `option?`: `string` ; `optionLabel?`: `string` ; `values?`: \{ `selected?`: `boolean` ; `value?`: `string` ; `valueLabel?`: `string` }[] }) => [`ConfigOption`](interfaces/ConfigOption.md)  |
| `decode`      | (`input`: `Uint8Array` \| `Reader`, `length?`: `number`) => [`ConfigOption`](interfaces/ConfigOption.md)                                                                                                  |
| `encode`      | (`message`: [`ConfigOption`](interfaces/ConfigOption.md), `writer?`: `Writer`) => `Writer`                                                                                                                |
| `fromJSON`    | (`object`: `any`) => [`ConfigOption`](interfaces/ConfigOption.md)                                                                                                                                         |
| `fromPartial` | (`object`: \{ `option?`: `string` ; `optionLabel?`: `string` ; `values?`: \{ `selected?`: `boolean` ; `value?`: `string` ; `valueLabel?`: `string` }[] }) => [`ConfigOption`](interfaces/ConfigOption.md) |
| `toJSON`      | (`message`: [`ConfigOption`](interfaces/ConfigOption.md)) => `unknown`                                                                                                                                    |

---

### ConfigValue

• **ConfigValue**: `Object`

#### Type declaration

| Name          | Type                                                                                                                                 |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| `create`      | (`base?`: \{ `selected?`: `boolean` ; `value?`: `string` ; `valueLabel?`: `string` }) => [`ConfigValue`](interfaces/ConfigValue.md)  |
| `decode`      | (`input`: `Uint8Array` \| `Reader`, `length?`: `number`) => [`ConfigValue`](interfaces/ConfigValue.md)                               |
| `encode`      | (`message`: [`ConfigValue`](interfaces/ConfigValue.md), `writer?`: `Writer`) => `Writer`                                             |
| `fromJSON`    | (`object`: `any`) => [`ConfigValue`](interfaces/ConfigValue.md)                                                                      |
| `fromPartial` | (`object`: \{ `selected?`: `boolean` ; `value?`: `string` ; `valueLabel?`: `string` }) => [`ConfigValue`](interfaces/ConfigValue.md) |
| `toJSON`      | (`message`: [`ConfigValue`](interfaces/ConfigValue.md)) => `unknown`                                                                 |

---

### Port

• **Port**: `Object`

#### Type declaration

| Name          | Type                                                                                                                                                                                          |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`      | (`base?`: \{ `address?`: `string` ; `hardwareId?`: `string` ; `label?`: `string` ; `properties?`: {} ; `protocol?`: `string` ; `protocolLabel?`: `string` }) => [`Port`](interfaces/Port.md)  |
| `decode`      | (`input`: `Uint8Array` \| `Reader`, `length?`: `number`) => [`Port`](interfaces/Port.md)                                                                                                      |
| `encode`      | (`message`: [`Port`](interfaces/Port.md), `writer?`: `Writer`) => `Writer`                                                                                                                    |
| `fromJSON`    | (`object`: `any`) => [`Port`](interfaces/Port.md)                                                                                                                                             |
| `fromPartial` | (`object`: \{ `address?`: `string` ; `hardwareId?`: `string` ; `label?`: `string` ; `properties?`: {} ; `protocol?`: `string` ; `protocolLabel?`: `string` }) => [`Port`](interfaces/Port.md) |
| `toJSON`      | (`message`: [`Port`](interfaces/Port.md)) => `unknown`                                                                                                                                        |

---

### Programmer

• **Programmer**: `Object`

#### Type declaration

| Name          | Type                                                                                                                     |
| :------------ | :----------------------------------------------------------------------------------------------------------------------- |
| `create`      | (`base?`: \{ `id?`: `string` ; `name?`: `string` ; `platform?`: `string` }) => [`Programmer`](interfaces/Programmer.md)  |
| `decode`      | (`input`: `Uint8Array` \| `Reader`, `length?`: `number`) => [`Programmer`](interfaces/Programmer.md)                     |
| `encode`      | (`message`: [`Programmer`](interfaces/Programmer.md), `writer?`: `Writer`) => `Writer`                                   |
| `fromJSON`    | (`object`: `any`) => [`Programmer`](interfaces/Programmer.md)                                                            |
| `fromPartial` | (`object`: \{ `id?`: `string` ; `name?`: `string` ; `platform?`: `string` }) => [`Programmer`](interfaces/Programmer.md) |
| `toJSON`      | (`message`: [`Programmer`](interfaces/Programmer.md)) => `unknown`                                                       |
