[**vscode-arduino-api**](../README.md)

---

# Interface: BoardDetails

**`Alpha`**

The lightweight representation of all details of a particular board. See
[`BoardDetailsResponse`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse)
for the CLI API.

## Extends

- `Readonly`\<`Pick`\<`BoardDetailsResponse`, `"fqbn"` \| `"name"` \| `"configOptions"` \| `"programmers"` \| `"defaultProgrammerId"`\>\>

## Properties

### buildProperties

> `readonly` **buildProperties**: [`BuildProperties`](../type-aliases/BuildProperties.md)

**`Alpha`**

---

### configOptions

> `readonly` **configOptions**: [`ConfigOption`](../type-aliases/ConfigOption.md)[]

**`Alpha`**

The board's custom configuration options.

#### Inherited from

`Readonly.configOptions`

---

### defaultProgrammerId

> `readonly` **defaultProgrammerId**: `string`

**`Alpha`**

Default programmer for the board.

#### Inherited from

`Readonly.defaultProgrammerId`

---

### fqbn

> `readonly` **fqbn**: `string`

**`Alpha`**

The fully qualified board name of the board.

#### Inherited from

`Readonly.fqbn`

---

### name

> `readonly` **name**: `string`

**`Alpha`**

Name used to identify the board to humans (e.g., Arduino Uno).

#### Inherited from

`Readonly.name`

---

### programmers

> `readonly` **programmers**: [`Programmer`](../type-aliases/Programmer.md)[]

**`Alpha`**

List of programmers supported by the board.

#### Inherited from

`Readonly.programmers`

---

### toolsDependencies

> `readonly` **toolsDependencies**: `Readonly`\<`Pick`\<`ToolsDependencies`, `"name"` \| `"version"` \| `"packager"`\>\>[]

**`Alpha`**
