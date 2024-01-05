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

---

### buildPath

• `Readonly` **buildPath**: `string`

The compiler build path

#### Inherited from

Readonly.buildPath

---

### buildPlatform

• `Readonly` **buildPlatform**: `undefined` \| `InstalledPlatformReference`

The platform used for the build (if referenced from the board platform)

#### Inherited from

Readonly.buildPlatform

---

### buildProperties

• `Readonly` **buildProperties**: `Readonly`\<`Record`\<`string`, `string`\>\>

---

### executableSectionsSize

• `Readonly` **executableSectionsSize**: `ExecutableSectionSize`[]

The size of the executable split by sections

#### Inherited from

Readonly.executableSectionsSize

---

### usedLibraries

• `Readonly` **usedLibraries**: `Library`[]

The libraries used in the build

#### Inherited from

Readonly.usedLibraries
