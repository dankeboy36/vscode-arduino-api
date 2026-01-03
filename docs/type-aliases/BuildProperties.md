[**vscode-arduino-api**](../README.md)

---

# Type Alias: BuildProperties

> **BuildProperties** = `Readonly`\<`Record`\<`string`, `string`\>\>

Build properties used for compiling. The board-specific properties are
retrieved from `board.txt` and `platform.txt`. For example, if the
`board.txt` contains the `build.tarch=xtensa` entry for the
`esp32:esp32:esp32` board, the record includes the `"build.tarch": "xtensa"`
property.
