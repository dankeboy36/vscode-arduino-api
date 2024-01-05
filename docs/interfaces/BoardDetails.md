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

---

### configOptions

• `Readonly` **configOptions**: [`ConfigOption`](ConfigOption.md)[]

The board's custom configuration options.

#### Inherited from

Readonly.configOptions

---

### defaultProgrammerId

• `Readonly` **defaultProgrammerId**: `string`

Default programmer for the board

#### Inherited from

Readonly.defaultProgrammerId

---

### fqbn

• `Readonly` **fqbn**: `string`

The fully qualified board name of the board.

#### Inherited from

Readonly.fqbn

---

### name

• `Readonly` **name**: `string`

Name used to identify the board to humans (e.g., Arduino Uno).

#### Inherited from

Readonly.name

---

### programmers

• `Readonly` **programmers**: [`Programmer`](Programmer.md)[]

List of programmers supported by the board

#### Inherited from

Readonly.programmers

---

### toolsDependencies

• `Readonly` **toolsDependencies**: `Readonly`\<`Pick`\<`ToolsDependencies`, `"name"` \| `"version"` \| `"packager"`\>\>[]
