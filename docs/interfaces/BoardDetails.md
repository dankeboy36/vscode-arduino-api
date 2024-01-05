# Interface: BoardDetails

The lightweight representation of all details of a particular board. See [`BoardDetailsResponse`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the CLI API.

## Hierarchy

- `Readonly`\<`Pick`\<`BoardDetailsResponse`, `"fqbn"` \| `"name"` \| `"configOptions"` \| `"programmers"` \| `"defaultProgrammerId"`\>\>

  ↳ **`BoardDetails`**

## Table of contents

### Properties

- [buildProperties](BoardDetails.md#buildproperties)
- [configOptions](BoardDetails.md#configoptions)
- [defaultProgrammerId](BoardDetails.md#defaultprogrammerid)
- [fqbn](BoardDetails.md#fqbn)
- [name](BoardDetails.md#name)
- [programmers](BoardDetails.md#programmers)
- [toolsDependencies](BoardDetails.md#toolsdependencies)

## Properties

### buildProperties

• `Readonly` **buildProperties**: `Readonly`\<`Record`\<`string`, `string`\>\>

#### Defined in

[src/api.ts:227](https://github.com/dankeboy36/vscode-arduino-api/blob/0badc9d/src/api.ts#L227)

---

### configOptions

• `Readonly` **configOptions**: [`ConfigOption`](ConfigOption.md)[]

The board's custom configuration options.

#### Inherited from

Readonly.configOptions

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/board.d.ts:43

---

### defaultProgrammerId

• `Readonly` **defaultProgrammerId**: `string`

Default programmer for the board

#### Inherited from

Readonly.defaultProgrammerId

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/board.d.ts:51

---

### fqbn

• `Readonly` **fqbn**: `string`

The fully qualified board name of the board.

#### Inherited from

Readonly.fqbn

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/board.d.ts:20

---

### name

• `Readonly` **name**: `string`

Name used to identify the board to humans (e.g., Arduino Uno).

#### Inherited from

Readonly.name

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/board.d.ts:22

---

### programmers

• `Readonly` **programmers**: [`Programmer`](Programmer.md)[]

List of programmers supported by the board

#### Inherited from

Readonly.programmers

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/board.d.ts:45

---

### toolsDependencies

• `Readonly` **toolsDependencies**: `Readonly`\<`Pick`\<`ToolsDependencies`, `"name"` \| `"version"` \| `"packager"`\>\>[]

#### Defined in

[src/api.ts:226](https://github.com/dankeboy36/vscode-arduino-api/blob/0badc9d/src/api.ts#L226)
