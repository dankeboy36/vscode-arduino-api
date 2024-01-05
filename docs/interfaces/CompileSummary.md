# Interface: CompileSummary

Summary of a sketch compilation. See [`CompileResponse`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#compileresponse) for the CLI API.

## Hierarchy

- `Readonly`\<`Pick`\<`CompileResponse`, `"buildPath"` \| `"usedLibraries"` \| `"executableSectionsSize"` \| `"boardPlatform"` \| `"buildPlatform"`\>\>

  ↳ **`CompileSummary`**

## Table of contents

### Properties

- [boardPlatform](CompileSummary.md#boardplatform)
- [buildPath](CompileSummary.md#buildpath)
- [buildPlatform](CompileSummary.md#buildplatform)
- [buildProperties](CompileSummary.md#buildproperties)
- [executableSectionsSize](CompileSummary.md#executablesectionssize)
- [usedLibraries](CompileSummary.md#usedlibraries)

## Properties

### boardPlatform

• `Readonly` **boardPlatform**: `undefined` \| `InstalledPlatformReference`

The platform where the board is defined

#### Inherited from

Readonly.boardPlatform

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/compile.d.ts:118

---

### buildPath

• `Readonly` **buildPath**: `string`

The compiler build path

#### Inherited from

Readonly.buildPath

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/compile.d.ts:112

---

### buildPlatform

• `Readonly` **buildPlatform**: `undefined` \| `InstalledPlatformReference`

The platform used for the build (if referenced from the board platform)

#### Inherited from

Readonly.buildPlatform

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/compile.d.ts:120

---

### buildProperties

• `Readonly` **buildProperties**: `Readonly`\<`Record`\<`string`, `string`\>\>

#### Defined in

[src/api.ts:253](https://github.com/dankeboy36/vscode-arduino-api/blob/0badc9d/src/api.ts#L253)

---

### executableSectionsSize

• `Readonly` **executableSectionsSize**: `ExecutableSectionSize`[]

The size of the executable split by sections

#### Inherited from

Readonly.executableSectionsSize

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/compile.d.ts:116

---

### usedLibraries

• `Readonly` **usedLibraries**: `Library`[]

The libraries used in the build

#### Inherited from

Readonly.usedLibraries

#### Defined in

node_modules/ardunno-cli/dist/api/cc/arduino/cli/commands/v1/compile.d.ts:114
