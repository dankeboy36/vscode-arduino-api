# Interface: SketchFolder

The current state in the sketch folder. For example, the FQBN of the selected board, the selected port, etc.

## Table of contents

### Properties

- [board](SketchFolder.md#board)
- [compileSummary](SketchFolder.md#compilesummary)
- [configOptions](SketchFolder.md#configoptions)
- [port](SketchFolder.md#port)
- [selectedProgrammer](SketchFolder.md#selectedprogrammer)
- [sketchPath](SketchFolder.md#sketchpath)

## Properties

### board

• `Readonly` **board**: `undefined` \| [`BoardIdentifier`](../modules.md#boardidentifier) \| [`BoardDetails`](BoardDetails.md)

The currently selected board associated with the sketch. If the `board` is undefined, no board is selected.
If the `board` is a `BoardIdentifier`, it could be a recognized board on a detected port, but the board's platform could be absent.
If platform is installed, the `board` is the lightweight representation of the board's detail. This information is
[provided by the Arduino CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse)
for the currently selected board in the sketch folder.

---

### compileSummary

• `Readonly` **compileSummary**: `undefined` \| [`CompileSummary`](CompileSummary.md)

The summary of the latest sketch compilation. When the `sketchPath` is available but the sketch has not been verified (compiled), the compile summary can be `undefined`.

---

### configOptions

• `Readonly` **configOptions**: `undefined` \| `string`

The FQBN with all the custom board options (if any) for the sketch. `a:b:c:opt1=value_1,opt2=value_2` means `{ "opt1": "value_1", "opt2": "value_2" }` config options are configured.

---

### port

• `Readonly` **port**: `undefined` \| `Readonly`\<`Pick`\<[`Port`](Port.md), `"address"` \| `"protocol"`\>\> \| `Readonly`\<[`Port`](Port.md)\>

The currently selected port in the sketch folder.

---

### selectedProgrammer

• `Readonly` **selectedProgrammer**: `undefined` \| `string` \| `Readonly`\<[`Programmer`](Programmer.md)\>

The currently selected programmer.

---

### sketchPath

• `Readonly` **sketchPath**: `string`

Absolute filesystem path of the sketch folder.
