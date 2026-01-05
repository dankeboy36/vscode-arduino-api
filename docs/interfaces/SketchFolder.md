[**vscode-arduino-api**](../README.md)

---

# Interface: SketchFolder

The current state in the sketch folder. For example, the FQBN of the selected
board, the selected port, etc.

## Properties

### board

> `readonly` **board**: [`BoardIdentifier`](../type-aliases/BoardIdentifier.md) \| [`BoardDetails`](BoardDetails.md) \| `undefined`

**`Alpha`**

The currently selected board associated with the sketch. If the `board` is
undefined, no board is selected. If the `board` is a `BoardIdentifier`, it
could be a recognized board on a detected port, but the board's platform
could be absent. If platform is installed, the `board` is the lightweight
representation of the board's detail. This information is [provided by the
Arduino
CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse)
for the currently selected board in the sketch folder.

---

### compileSummary

> `readonly` **compileSummary**: [`CompileSummary`](CompileSummary.md) \| `undefined`

**`Alpha`**

The summary of the latest sketch compilation. When the `sketchPath` is
available but the sketch has not been verified (compiled), the compile
summary can be `undefined`.

---

### configOptions

> `readonly` **configOptions**: `string` \| `undefined`

**`Alpha`**

The FQBN with all the custom board options (if any) for the sketch.
`a:b:c:opt1=value_1,opt2=value_2` means `{ "opt1": "value_1", "opt2":
"value_2" }` config options are configured.

---

### port

> `readonly` **port**: `Readonly`\<`Pick`\<`Port`, `"protocol"` \| `"address"`\>\> \| `Readonly`\<[`Port`](../type-aliases/Port.md)\> \| `undefined`

**`Alpha`**

The currently selected port in the sketch folder.

---

### selectedProgrammer

> `readonly` **selectedProgrammer**: `string` \| `Readonly`\<[`Programmer`](Programmer.md)\> \| `undefined`

**`Alpha`**

The currently selected programmer.

---

### sketchPath

> `readonly` **sketchPath**: `string`

Absolute filesystem path of the sketch folder.
