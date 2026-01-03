[**vscode-arduino-api**](../README.md)

---

# Interface: CliConfig

Bare minimum representation of the Arduino CLI
[configuration](https://arduino.github.io/arduino-cli/latest/configuration).

## Properties

### dataDirPath

> `readonly` **dataDirPath**: `string` \| `undefined`

**`Alpha`**

Filesystem path to the
[`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
location.

---

### userDirPath

> `readonly` **userDirPath**: `string` \| `undefined`

**`Alpha`**

Filesystem path to the
[`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
location. This is the sketchbook path.
