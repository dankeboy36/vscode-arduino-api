# Interface: CliConfig

Bare minimum representation of the Arduino CLI [configuration](https://arduino.github.io/arduino-cli/latest/configuration).

## Table of contents

### Properties

- [dataDirPath](CliConfig.md#datadirpath)
- [userDirPath](CliConfig.md#userdirpath)

## Properties

### dataDirPath

• `Readonly` **dataDirPath**: `undefined` \| `string`

Filesystem path to the [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location.

---

### userDirPath

• `Readonly` **userDirPath**: `undefined` \| `string`

Filesystem path to the [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location. This is the sketchbook path.
