# vscode-arduino-api

[![Build](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/build.yml)

[Arduino IDE](https://github.com/arduino/arduino-ide) API for VS Code extensions.

This VS Code extension does not provide any functionality but a bridge between the Arduino IDE and external tools implemented as a VS Code extension. Please reference [arduino/arduino-ide#58](https://github.com/arduino/arduino-ide/issues/58) to see why this VSIX has been created.

> ⚠️ This extension has nothing to do with the [Visual Studio Code extension for Arduino](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-arduino).

## API

### Variables

| Name             | Description                                                                                                                                                                           | Type                        |    Note     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | :---------: |
| `openedSketches` | All opened sketch folders in the window.                                                                                                                                              | `SketchFolder[]`            | ⚠️ `@alpha` |
| `currentSketch`  | The currently active sketch (folder) or `undefined`. The current sketch is the one that currently has focus or most recently had focus. The current sketch is in the opened sketches. | `SketchFolder \| undefined` | ⚠️ `@alpha` |
| `config`         | The currently configured Arduino CLI configuration.                                                                                                                                   | `CliConfig`                 | ⚠️ `@alpha` |

### Events

| Name                       | Description                                                                                                                                   | Type                                                  |    Note     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | :---------: |
| `onDidChangeCurrentSketch` | An event that is emitted when the current sketch has changed. _Note_ that the event also fires when the active editor changes to `undefined`. | `Event<{ currentSketch: SketchFolder \| undefined }>` | ⚠️ `@alpha` |
| `onDidChangeSketchFolders` | An event that is emitted when sketch folders are added or removed.                                                                            | `Event<SketchFoldersChangeEvent>`                     | ⚠️ `@alpha` |
| `onDidChangeSketch`        | An event that is emitted when the selected board, port, etc., has changed in the sketch folder.                                               | `Event<ChangeEvent<SketchFolder>>`                    | ⚠️ `@alpha` |
| `onDidChangeConfig`        | An event that is emitter when the sketchbook (`directories.data`) or the data directory (`directories.data`) path has changed.                | `Event<ChangeEvent<CliConfig>>`                       | ⚠️ `@alpha` |

### `SketchFolder`

| Name             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Type                                                                      |    Note     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | :---------: |
| `sketchPath`     | Absolute filesystem path of the sketch folder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `string`                                                                  | ⚠️ `@alpha` |
| `compileSummary` | The summary of the latest sketch compilation. When the `sketchPath` is available but the sketch has not been verified (compiled), the compile summary can be `undefined`.                                                                                                                                                                                                                                                                                                                                                                                           | `CompileSummary`                                                          | ⚠️ `@alpha` |
| `board`          | The currently selected board associated with the sketch. If the `board` is undefined, no board is selected. If the `board` is a `BoardIdentifier`, it could be a recognized board on a detected port, but the board's platform could be absent. If platform is installed, the `board` is the lightweight representation of the board's detail. This information is [provided by the Arduino CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the currently selected board in the sketch folder. | `string`                                                                  | ⚠️ `@alpha` |
| `port`           | The currently selected port in the sketch folder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | [`Port`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#port) | ⚠️ `@alpha` |

## How to Use

If you're developing an external tool for the Arduino IDE, this extension will be available at runtime from the IDE.

If you want to use the Arduino APIs, you have to do the followings:

1.  Install the [Arduino API types](https://www.npmjs.com/package/vscode-arduino-api) from `npm`:

    ```shell
    npm install vscode-arduino-api --save
    ```

1.  Consume the `ArduinoContext` extension API in your VS Code extension:

    ```ts
    import * as vscode from 'vscode';
    import type { ArduinoContext } from 'vscode-arduino-api';

    export function activate(context: vscode.ExtensionContext) {
      const context: ArduinoContext = vscode.extensions.getExtension(
        'dankeboy36.vscode-arduino-api'
      )?.exports;
      if (!context) {
        // Failed to load the Arduino API.
        return;
      }

      // Use the Arduino API in your VS Code extension.

      // Read the state.
      // Register a command to access the sketch path and show it as an information message.
      context.subscriptions.push(
        vscode.commands.registerCommand('myExtension.showSketchPath', () => {
          vscode.window.showInformationMessage(
            `Sketch path: ${arduinoContext.sketchPath}`
          );
        })
      );

      // Listen on state change.
      // Register a listener to show the FQBN of the currently selected board as an information message.
      context.onDidChangeSketch((event) => {
        if (event.changedProperties.includes('board')) {
          vscode.window.showInformationMessage(
            `FQBN: ${event.object.board?.fqbn}`
          );
        }
      });
    }
    ```

## Extension Settings

This extension contributes the following settings:

- `arduinoAPI.log`: set to `true` to enable logging of state updates. It's `false` by default.
- `arduinoAPI.compareBeforeUpdate`: set to `true` to relax the state update. If `true`, a value will be updated when the new value and the current value are not [`deepStrictEqual`](https://nodejs.org/api/assert.html#comparison-details_1).

## FAQs

---

- Q: What does ⚠️ `@alpha` mean?
- A: This API is in an alpha state and might change. The initial idea of this project was to establish a bare minimum layer and help Arduino IDE tool developers start with something. I make breaking changes only when necessary, keep it backward compatible, or provide a migration guide in the future. Please prepare for breaking changes.

---

- Q: Why do I have to install `vscode-arduino-api` from `npm`.
- A: `vscode-arduino-api` only contains types for the API. The actual code will be part of the VS Code extension.

---

- Q: Are there any dependent examples?
- A: Yes, for example, [dankeboy36/esp-exception-decoder](https://github.com/dankeboy36/esp-exception-decoder) or [earlephilhower/arduino-littlefs-upload](https://github.com/earlephilhower/arduino-littlefs-upload).
