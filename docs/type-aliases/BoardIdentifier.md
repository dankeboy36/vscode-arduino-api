[**vscode-arduino-api**](../README.md)

---

# Type Alias: BoardIdentifier

> **BoardIdentifier** = `Nullable`\<`ApiBoard`, `"fqbn"`\>

Lightweight information to identify a board:

- The board's `name` is to provide a fallback for the UI. Preferably do not use
  this property for any sophisticated logic and board comparison. It must
  never participate in the board's identification.
- The FQBN might contain boards config options if selected from the discovered
  ports (see
  [arduino/arduino-ide#1588](https://github.com/arduino/arduino-ide/issues/1588)).
