import assert from 'assert';
import { after } from 'mocha';
import * as vscode from 'vscode';
import type { ArduinoContext, ArduinoState, BoardDetails } from '../../api';
import { updateStateCommandId } from '../../arduinoContext';

const extensionId = 'dankeboy36.vscode-arduino-api';

describe('arduinoContext', () => {
  let arduinoContext: ArduinoContext;
  const toDispose: vscode.Disposable[] = [];

  before(async () => {
    const extension = vscode.extensions.getExtension(extensionId);
    assert.notEqual(extension, undefined);
    await extension?.activate();
    arduinoContext = extension?.exports;
    assert.notEqual(arduinoContext, undefined);
  });

  after(() => vscode.Disposable.from(...toDispose).dispose());

  const suite: Record<keyof ArduinoState, ArduinoState[keyof ArduinoState]> = {
    boardDetails: <BoardDetails>{
      PID: '',
      VID: '',
      configOptions: [],
      fqbn: 'a:b:c',
      programmers: [],
      requiredTools: [],
    },
    buildPath: 'path/to/build/folder',
    dataDirPath: 'path/to/directories.data',
    userDirPath: 'path/to/directories.user',
    fqbn: 'a:b:c',
    sketchPath: 'path/to/sketch',
    port: undefined,
  };

  Object.entries(suite).map(([name, expectedValue]) =>
    it(`should get and update '${name}' changes and receive an event on change`, async function () {
      this.slow(250);
      const key = <keyof ArduinoState>name;
      const value = arduinoContext[key];
      assert.deepEqual(value, undefined);
      const values: ArduinoState[keyof ArduinoState][] = [];
      toDispose.push(
        arduinoContext.onDidChange[key]((newValue) => {
          values.push(newValue);
        })
      );
      await update(key, expectedValue);
      const newValue = arduinoContext[key];
      assert.deepEqual(newValue, expectedValue);
      assert.deepEqual(values.length, 1);
      assert.deepEqual(values[0], expectedValue);
    })
  );

  async function update<T = ArduinoState>(
    key: keyof T,
    value: T[keyof T]
  ): Promise<void> {
    return vscode.commands.executeCommand(updateStateCommandId, { key, value });
  }
});
