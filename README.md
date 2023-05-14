# vscode-arduino-api

Arduino API for [Arduino IDE](https://github.com/arduino/arduino-ide) external tools developers using VS Code extensions.

This VS Code extensions does not provide any functionality, but a bridge between the Arduino IDE and external tools implemented as a VS Code extension. Please reference [arduino/arduino-ide#58](https://github.com/arduino/arduino-ide/issues/58) why this VSIX has been created. This extension has nothing to do with the [Visual Studio Code extension for Arduino](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-arduino). This extension does not work in VS Code.

## Features

Exposes the Arduino context for VS Code extensions:

| Name           | Description                                                                                                                                                                                                                                                                                                                         | Type                                                                      | Note        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- |
| `sketchPath`   | Absolute filesystem path of the sketch folder.                                                                                                                                                                                                                                                                                      | `string`                                                                  |
| `buildPath`    | The absolute filesystem path to the build folder of the sketch. When the `sketchPath` is available but the sketch has not been verified (compiled), the `buildPath` can be `undefined`.                                                                                                                                             | `string`                                                                  | ⚠️ `@alpha` |
| `fqbn`         | The Fully Qualified Board Name (FQBN) of the currently selected board in the Arduino IDE.                                                                                                                                                                                                                                           | `string`                                                                  |
| `boardDetails` | Lightweight representation of the board's detail. This information is [provided by the Arduino CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the currently selected board. It can be `undefined` if the `fqbn` is defined but the platform is not installed. | `BoardDetails`                                                            | ⚠️ `@alpha` |
| `port`         | The currently selected port in the Arduino IDE.                                                                                                                                                                                                                                                                                     | [`Port`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#port) |
| `userDirPath`  | Filesystem path to the [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location. This is the sketchbook path.                                                                                                                                                                  | `string`                                                                  |
| `dataDirPath`  | Filesystem path to the [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location                                                                                                                                                                                                | `string`                                                                  |

## How to Use

If you're developing an external tool for the Arduino IDE, this extension will be available at runtime from the IDE.

If you want to use the Arduino APIs, you have to do the followings:

1.  Install the [Arduino API types](https://www.npmjs.com/package/vscode-arduino-api) from `npm`:
    ```shell
    npm i -S vscode-arduino-api
    ```
1.  Add this VSIX as an `extensionDependencies` in your `package.json`:

    ```jsonc
    {
      "extensionDependencies": [
        "dankeboy36.vscode-arduino-api",
        // other dependencies
      ],
    }
    ```
1.  Consume the `ArduinoContext` extension API in your VS Code extension:

    ```ts
    import * as vscode from 'vscode';
    import type { ArduinoContext } from 'vscode-arduino-api';

    function activate(context: vscode.ExtensionContext) {
      const arduinoContext: ArduinoContext = vscode.extensions.getExtension(
        'dankeboy36.vscode-arduino-api'
      )?.exports;
      if (!arduinoContext) {
        // failed to load the Arduino API
        return;
      }
      // use the Arduino API in your VS Code extension...
    }
    ```

## FAQs

---

- Q: Why do I have to install `vscode-arduino-api` from `npm`.
- A: `vscode-arduino-api` only contains types for the API. The actual code wil be part of the VS Code extension.

---

- Q: I cannot find the `dankeboy36.vscode-arduino-api` extension in the [VS Code Marketplace](https://marketplace.visualstudio.com/vscode).
- A: Correct. This solution targets the [Arduino IDE](https://github.com/arduino/arduino-ide). I will publish the VSIX later, when it works in VS Code. By the way, the VSIX is signed with a verified published.
