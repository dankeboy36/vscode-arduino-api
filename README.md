# vscode-arduino-api

[![Tests](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/ci.yml)

[Arduino IDE](<(https://github.com/arduino/arduino-ide)>) API for VS Code extensions.

This VS Code extension does not provide any functionality but a bridge between the Arduino IDE and external tools implemented as a VS Code extension. Please reference [arduino/arduino-ide#58](https://github.com/arduino/arduino-ide/issues/58) to explain why this VSIX has been created.

> ⚠️ This extension has nothing to do with the [Visual Studio Code extension for Arduino](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-arduino). This extension does not work in VS Code.

## API

Exposes the Arduino context for VS Code extensions:

| Name             | Description                                                                                                                                                                                                                                                                                                                          | Type                                                                      | Note        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------- |
| `sketchPath`     | Absolute filesystem path of the sketch folder.                                                                                                                                                                                                                                                                                       | `string`                                                                  |
| `compileSummary` | The summary of the latest sketch compilation. When the `sketchPath` is available, but the sketch has not been verified (compiled), the `buildPath` can be `undefined`.                                                                                                                                                               | `CompileSummary`                                                          | ⚠️ `@alpha` |
| `fqbn`           | The Fully Qualified Board Name (FQBN) of the currently selected board in the Arduino IDE.                                                                                                                                                                                                                                            | `string`                                                                  |
| `boardDetails`   | Lightweight representation of the board's detail. This information is [provided by the Arduino CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the currently selected board. It can be `undefined` if the `fqbn` is defined, but the platform is not installed. | `BoardDetails`                                                            | ⚠️ `@alpha` |
| `port`           | The currently selected port in the Arduino IDE.                                                                                                                                                                                                                                                                                      | [`Port`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#port) |
| `userDirPath`    | Filesystem path to the [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location. This is the sketchbook path.                                                                                                                                                                   | `string`                                                                  | ⚠️ `@alpha` |
| `dataDirPath`    | Filesystem path to the [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location                                                                                                                                                                                                 | `string`                                                                  | ⚠️ `@alpha` |

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
      const arduinoContext: ArduinoContext = vscode.extensions.getExtension(
        'dankeboy36.vscode-arduino-api'
      )?.exports;
      if (!arduinoContext) {
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
      context.subscriptions.push(
        arduinoContext.onDidChange('fqbn')((fqbn) =>
          vscode.window.showInformationMessage(`FQBN: ${fqbn}`)
        )
      );
    }
    ```

## Extension Settings

This extension contributes the following settings:

- `arduinoAPI.log`: set to `true` to enable logging of state updates. It's `false` by default.
- `arduinoAPI.compareBeforeUpdate`: set to `true` to relax the state update. If `true`, a value will be updated when the new value and the current value are not [`deepStrictEqual`](https://nodejs.org/api/assert.html#comparison-details_1).

## FAQs

---

- Q: What does `@alpha` mean?
- A: This API is in an alpha state and might change. The initial idea of this project was to establish a bare minimum layer and help Arduino IDE tool developers start with something. I make breaking changes only when necessary, keep it backward compatible, or provide a migration guide in the future. Please prepare for breaking changes.

---

- Q: Why do I have to install `vscode-arduino-api` from `npm`.
- A: `vscode-arduino-api` only contains types for the API. The actual code will be part of the VS Code extension.

---

- Q: I cannot find the `dankeboy36.vscode-arduino-api` extension in neither the [VS Code Marketplace](https://marketplace.visualstudio.com/vscode) nor [Open VSX Registry](https://open-vsx.org/).
- A: Correct. This solution targets the [Arduino IDE](https://github.com/arduino/arduino-ide) 2.x. The IDE will contain this VSIX at runtime and will activate it before your tool VSIX. You do not even have to add `dankeboy36.vscode-arduino-api` to the `extensionDependencies`. I might publish the VSIX later when it works in VS Code. By the way, the VSIX is signed by a verified publisher. You can get the latest version from the GitHub [release page](https://github.com/dankeboy36/vscode-arduino-api/releases/latest).

---

- Q: Are there any dependent examples?
- A: Yes, for example, [dankeboy36/esp-exception-decoder](https://github.com/dankeboy36/esp-exception-decoder).

---

- Q: Are there plans to support it in VS Code?
- A: Sure.
