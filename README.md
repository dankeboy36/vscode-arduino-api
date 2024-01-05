# vscode-arduino-api

[![Build](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/build.yml)

[Arduino IDE](https://github.com/arduino/arduino-ide) API for VS Code extensions.

This VS Code extension does not provide any functionality but a bridge between the Arduino IDE and external tools implemented as a VS Code extension. Please reference [arduino/arduino-ide#58](https://github.com/arduino/arduino-ide/issues/58) to see why this VSIX has been created.

> ⚠️ This extension has nothing to do with the [Visual Studio Code extension for Arduino](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-arduino).

## API

[See](https://github.com/dankeboy36/vscode-arduino-api/blob/main/docs/README.md) the full API on GitHub.

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
            `Sketch path: ${context.sketchPath}`
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
