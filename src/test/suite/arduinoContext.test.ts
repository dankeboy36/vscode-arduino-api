import assert from 'node:assert/strict';
import vscode from 'vscode';
import type {
  ArduinoContext,
  ArduinoState,
  BoardDetails,
  Port,
} from '../../api';
import { __test } from '../../arduinoContext';

const { updateStateCommandId, defaultConfigValues, getWorkspaceConfig } =
  __test;

const extensionId = 'dankeboy36.vscode-arduino-api';

const port: Port = {
  address: 'address',
  label: 'port label',
  protocol: 'serial',
  protocolLabel: 'serial port',
  properties: {
    alma: 'korte',
    one: 'two',
  },
  hardwareId: '1730323',
};
const samePort: Port = {
  ...port,
  hardwareId: port.hardwareId,
  properties: {
    one: 'two',
    alma: 'korte',
  },
};
const boardDetails: BoardDetails = {
  configOptions: [],
  fqbn: 'a:b:c',
  name: 'ABC',
  programmers: [
    { id: 'one', name: 'one', platform: 'one' },
    { id: 'two', name: 'two', platform: 'two' },
  ],
  toolsDependencies: [
    { name: 'a', packager: 'a', version: '1' },
    { name: 'b', packager: 'b', version: '2' },
  ],
  buildProperties: { 'build.tarch': 'xtensa', x: 'y' },
  defaultProgrammerId: 'two',
};
const sameBoardDetails: BoardDetails = {
  ...boardDetails,
  fqbn: boardDetails.fqbn,
  toolsDependencies: boardDetails.toolsDependencies.slice(),
  programmers: boardDetails.programmers.slice(),
  buildProperties: { x: 'y', 'build.tarch': 'xtensa' },
};

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
    boardDetails,
    compileSummary: {
      buildPath: 'path/to/build/folder',
      usedLibraries: [],
      boardPlatform: undefined,
      buildPlatform: undefined,
      buildProperties: { 'build.tarch': 'xtensa' },
      executableSectionsSize: [],
    },
    dataDirPath: 'path/to/directories.data',
    userDirPath: 'path/to/directories.user',
    fqbn: 'a:b:c',
    sketchPath: 'path/to/sketch',
    port,
  };

  Object.entries(suite).map(([name, expectedValue]) =>
    it(`should get and update '${name}' changes and receive an event on change`, async function () {
      this.slow(250);
      const property = <keyof ArduinoState>name;
      const value = arduinoContext[property];
      assert.deepStrictEqual(value, undefined);
      const values: ArduinoState[keyof ArduinoState][] = [];
      toDispose.push(
        arduinoContext.onDidChange(property)((newValue) => {
          values.push(newValue);
        })
      );
      await update(property, expectedValue);
      const newValue = arduinoContext[property];
      assert.deepStrictEqual(newValue, expectedValue);
      assert.deepStrictEqual(values.length, 1);
      assert.deepStrictEqual(values[0], expectedValue);
    })
  );

  it('should error when updating with invalid params', async () => {
    const property = '♥';
    await assert.rejects(
      update(property, 'manó'),
      /Invalid state update: {"key":"♥","value":"manó"}/
    );
  });

  it('should gracefully handle when  when updating with invalid params', async () => {
    const circular = { b: 1, a: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (circular as any).circular = circular;
    const property = 'circular';
    await assert.rejects(
      update(property, circular),
      /Invalid state update: \[object Object\]/
    );
  });

  interface ConfigTest {
    readonly configKey: Parameters<typeof getWorkspaceConfig>[0];
    readonly defaultValue: unknown;
    readonly testValues: unknown[];
  }
  const testValues: Record<ConfigTest['configKey'], unknown[]> = {
    log: [true, false],
    compareBeforeUpdate: [true, false],
  };
  const configTests: ConfigTest[] = Object.entries(defaultConfigValues).map(
    ([key, value]) => ({
      configKey: key as ConfigTest['configKey'],
      defaultValue: value,
      testValues: testValues[key as ConfigTest['configKey']],
    })
  );

  configTests.map((configTest) =>
    it(`should support the 'arduinoAPI.${configTest.configKey}' configuration`, async () => {
      const { configKey, defaultValue, testValues } = configTest;
      await updateWorkspaceConfig(configKey, undefined);
      const actualInspect = vscode.workspace
        .getConfiguration('arduinoAPI')
        .inspect(configKey);
      assert.notEqual(actualInspect, undefined);
      assert.strictEqual(actualInspect?.defaultValue, defaultValue);
      for (const testValue of testValues) {
        await updateWorkspaceConfig(configKey, testValue);
        const actualValue = getWorkspaceConfig(configKey);
        assert.strictEqual(
          actualValue,
          testValue,
          `failed to get expected config value for '${configKey}'`
        );
      }
    })
  );

  interface StateUpdateTest<T = ArduinoState> {
    property: keyof T;
    value: T[keyof T];
    sameValue: T[keyof T];
  }
  const stateUpdateTests: StateUpdateTest[] = [
    { property: 'port', value: port, sameValue: samePort },
    {
      property: 'boardDetails',
      value: boardDetails,
      sameValue: sameBoardDetails,
    },
  ];
  stateUpdateTests.map((updateTest) =>
    it(`should ignore same value updates when 'compareBeforeUpdate' is 'true' (${updateTest.property})`, async function () {
      const { property, value, sameValue } = updateTest;
      assert.deepStrictEqual(value, sameValue);
      await update(property, value);
      assert.deepStrictEqual(arduinoContext[property], value);

      const updates: (typeof value | undefined)[] = [];
      toDispose.push(
        arduinoContext.onDidChange(property)((newValue) => {
          updates.push(newValue);
        })
      );

      await updateWorkspaceConfig('compareBeforeUpdate', true);
      await update(property, value);
      assert.strictEqual(updates.length, 0);
      await update(property, sameValue);
      assert.strictEqual(updates.length, 0, JSON.stringify(updates[0]));

      await updateWorkspaceConfig('compareBeforeUpdate', false);
      await update(property, sameValue);
      assert.strictEqual(updates.length, 1);
      assert.deepStrictEqual(updates[0], sameValue);
      assert.deepStrictEqual(updates[0], value);

      await updateWorkspaceConfig('compareBeforeUpdate', true);
      await update(property, undefined);
      assert.strictEqual(updates.length, 2);
      assert.deepStrictEqual(updates[1], undefined);
      await update(property, sameValue);
      assert.strictEqual(updates.length, 3);
      assert.deepStrictEqual(updates[2], sameValue);
      assert.deepStrictEqual(updates[2], value);

      assert.deepStrictEqual(arduinoContext[property], sameValue);
    })
  );

  it('should error when disposed', async () => {
    assert.strictEqual('dispose' in arduinoContext, true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const disposable = <{ dispose: unknown }>(arduinoContext as any);
    assert.strictEqual(typeof disposable.dispose === 'function', true);
    (<{ dispose(): unknown }>disposable).dispose();

    assert.throws(() => arduinoContext.fqbn, /Disposed/);
    await assert.rejects(
      update('fqbn', undefined),
      (reason) =>
        reason instanceof Error &&
        reason.message === `command '${updateStateCommandId}' not found`
    );
  });

  async function update<T = ArduinoState>(
    key: keyof T,
    value: T[keyof T]
  ): Promise<void> {
    return vscode.commands.executeCommand(updateStateCommandId, { key, value });
  }

  async function updateWorkspaceConfig(
    configKey: ConfigTest['configKey'],
    value: unknown
  ): Promise<void> {
    return vscode.workspace
      .getConfiguration('arduinoAPI')
      .update(configKey, value);
  }
});
