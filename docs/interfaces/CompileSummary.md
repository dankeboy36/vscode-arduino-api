[**vscode-arduino-api**](../README.md)

---

# Interface: CompileSummary

**`Alpha`**

Summary of a sketch compilation. See
[`BuilderResult`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BuilderResult)
of the CLI API.

## Extends

- `Readonly`\<`Pick`\<`BuilderResult`, `"buildPath"` \| `"usedLibraries"` \| `"executableSectionsSize"` \| `"boardPlatform"` \| `"buildPlatform"`\>\>

## Properties

### boardPlatform

> `readonly` **boardPlatform**: `InstalledPlatformReference` \| `undefined`

**`Alpha`**

The platform where the board is defined.

#### Inherited from

`Readonly.boardPlatform`

---

### buildPath

> `readonly` **buildPath**: `string`

**`Alpha`**

The compiler build path.

#### Inherited from

`Readonly.buildPath`

---

### buildPlatform

> `readonly` **buildPlatform**: `InstalledPlatformReference` \| `undefined`

**`Alpha`**

The platform used for the build (if referenced from the board platform).

#### Inherited from

`Readonly.buildPlatform`

---

### buildProperties

> `readonly` **buildProperties**: [`BuildProperties`](../type-aliases/BuildProperties.md)

**`Alpha`**

---

### executableSectionsSize

> `readonly` **executableSectionsSize**: `ExecutableSectionSize`[]

**`Alpha`**

The size of the executable split by sections.

#### Inherited from

`Readonly.executableSectionsSize`

---

### usedLibraries

> `readonly` **usedLibraries**: `Library`[]

**`Alpha`**

The libraries used in the build.

#### Inherited from

`Readonly.usedLibraries`
