# vscode-arduino-api

[![Build](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dankeboy36/vscode-arduino-api/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/vscode-arduino-api)

This is a types-only npm package providing the ArduinoContext API contract for Arduino IDE 2.x and BoardLab tools. The npm tarball ships no runtime JavaScript; runtime providers are supplied by the host environment.

The `main` entry in `package.json` exists for the Arduino IDE 2.x / Theia extension build. The runtime JavaScript referenced by `main` is not published to npm.

## What this is

- A compile-time contract for the `ArduinoContext` API.
- The npm package contains no runtime JavaScript.
- The runtime provider is host-specific (IDE2 built-in or BoardLab in VS Code).

The primary, current target is Visual Studio Code with BoardLab as the runtime provider. The IDE2 lane (0.1.x) is legacy and receives compatibility-only updates.

## Runtime providers

- Visual Studio Code: provider is BoardLab (`dankeboy36.boardlab`). Tools should depend on BoardLab for runtime access.
- Arduino IDE 2.x: provider is bundled in the IDE. It does not download this extension from Open VSX or the Visual Studio Code Marketplace.

## Compatibility lanes

- BoardLab lane: `vscode-arduino-api@latest` (0.2.x+) for Visual Studio Code + BoardLab.
- IDE2 lane: `vscode-arduino-api@ide2` (0.1.x) for Arduino IDE 2.x tools ([deprecated API surface](https://github.com/dankeboy36/vscode-arduino-api/blob/0.1.2/src/api.ts)).

## Install types

This package provides only TypeScript types. Install the appropriate version depending on your target environment:

### Visual Studio Code + BoardLab tools

```shell
npm install -D vscode-arduino-api
```

BoardLab provides the runtime API in Visual Studio Code and must be present as an extension dependency.

### Arduino IDE 2.x tools (deprecated API)

```shell
npm install -D vscode-arduino-api@ide2
```

### Additional type dependencies

These peer dependencies are required for type resolution. Install them if they are not already present in your extension development setup:

```shell
npm install -D ardunno-cli boards-list @types/vscode
```

Only one provider is active at a time. Choose the provider that matches your target. If you target IDE2 only, use the IDE2 provider ID and do not include BoardLab.

## Resolve provider at runtime

```ts
import * as vscode from 'vscode'
import type { ArduinoContext } from 'vscode-arduino-api'

// Visual Studio Code + BoardLab target.
const PROVIDERS = ['dankeboy36.boardlab'] as const

// Arduino IDE 2.x target: use this instead of the BoardLab provider.
// const PROVIDERS = ['dankeboy36.vscode-arduino-api'] as const

export function tryGetArduinoContext(): ArduinoContext | undefined {
  for (const id of PROVIDERS) {
    const ext = vscode.extensions.getExtension(id)
    const api = ext?.exports as ArduinoContext | undefined
    if (api) return api
  }
  return undefined
}
```

## Publishing guidance

- Visual Studio Code extension: add `extensionDependencies` on `dankeboy36.boardlab`.
- Arduino IDE 2.x tool VSIX: do not add `extensionDependencies`; IDE2 does not download from Open VSX or the Visual Studio Code Marketplace.

## Dist-tags and releases

- IDE2 lane: publish 0.1.x patch releases and apply the `ide2` dist-tag, which always points to the latest 0.1.x version compatible with Arduino IDE 2.x.
- BoardLab lane: `latest` remains 0.2.x+.

```shell
npm dist-tag ls vscode-arduino-api
```

## API reference

See the generated API docs in [`docs/README.md`](./docs/README.md).
