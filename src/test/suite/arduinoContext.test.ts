import assert from 'node:assert/strict';
import { format } from 'node:util';
import vscode from 'vscode';
import type {
  ArduinoContext,
  ArduinoState,
  BoardDetails,
  ChangeEvent,
  CliConfig,
  Port,
  SketchFolder,
} from '../../api';
import { __test, createArduinoContext } from '../../arduinoContext';
import { InmemoryState } from '../../inmemoryState';

const {
  updateStateCommandId,
  defaultConfigValues,
  getWorkspaceConfig,
  isCliConfig,
  isSketchFolder,
  isUpdateCliConfigParams,
  isUpdateCurrentSketchParams,
  isUpdateSketchFoldersParams,
  isUpdateSketchParams,
} = __test;

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

const sketchFolder: SketchFolder = {
  board: boardDetails,
  compileSummary: {
    buildPath: '/path/to/bin',
    buildProperties: { 'build.tarch': 'xtensa', x: 'y' },
    usedLibraries: [],
    executableSectionsSize: [],
    boardPlatform: undefined,
    buildPlatform: undefined,
  },
  port,
  sketchPath: '/path/to/sketchbook/my_sketch',
};

describe('createArduinoContext', () => {
  describe('isCliConfig', () => {
    (
      [
        [undefined, false],
        [{ alma: 'korte' }, false],
        [{ userDirPath: 'path' }, false],
        [{ dataDirPath: 'path' }, false],
        [{ userDirPath: true, dataDirPath: 420 }, false],
        [{ userDirPath: undefined, dataDirPath: undefined }, true],
        [{ userDirPath: undefined, dataDirPath: 'path' }, true],
        [{ userDirPath: 'path', dataDirPath: 'path' }, true],
      ] as [unknown, boolean][]
    ).map(([input, expected]) =>
      it(`${format(input)} should${
        expected ? '' : ' not'
      } be a valid CLI config`, () =>
        assert.strictEqual(isCliConfig(input), expected))
    );
  });

  describe('isUpdateSketchFoldersParams', () => {
    const validParams = {
      openedSketches: [sketchFolder],
      addedPaths: [sketchFolder.sketchPath],
      removedPaths: [],
    };

    it('should be ok when the params is valid', () => {
      assert.ok(isUpdateSketchFoldersParams(validParams));
    });

    Object.keys(validParams).map((property) =>
      it(`should be false when '${property}' is missing`, () => {
        const copy: Record<string, unknown> = {
          ...validParams,
        };
        delete copy[property];
        assert.strictEqual(isUpdateSketchFoldersParams(copy), false);
      })
    );

    Object.keys(validParams).map((property) =>
      it(`should be false when '${property}' has invalid value`, () => {
        const copy: Record<string, unknown> = {
          ...validParams,
        };
        // All props are array at the moment
        copy[property] = [{ alma: 'korte' }];
        assert.strictEqual(isUpdateSketchFoldersParams(copy), false);
      })
    );
  });

  describe('isSketchFolder', () => {
    it("should be ok when the 'board' is undefined", () => {
      const folder: SketchFolder = {
        ...sketchFolder,
        board: undefined,
      };
      assert.ok(isSketchFolder(folder));
    });

    it("should be ok when the 'board' is a name-only identifier", () => {
      const folder: SketchFolder = {
        ...sketchFolder,
        board: { name: 'ABC', fqbn: undefined },
      };
      assert.ok(isSketchFolder(folder));
    });

    it("should be ok when the 'board' is an identifier", () => {
      const folder: SketchFolder = {
        ...sketchFolder,
        board: { name: 'ABC', fqbn: 'a:b:c' },
      };
      assert.ok(isSketchFolder(folder));
    });

    it("should be ok when the 'board' is a complete details", () => {
      assert.ok(isSketchFolder(sketchFolder));
    });

    Object.keys(sketchFolder).map((property) =>
      it(`should be false when '${property}' is missing`, () => {
        const copy: Record<string, unknown> = {
          ...sketchFolder,
        };
        delete copy[property];
        assert.strictEqual(isSketchFolder(copy), false);
      })
    );

    Object.keys(sketchFolder).map((property) =>
      it(`should be false when '${property}' has invalid value`, () => {
        const copy: Record<string, unknown> = {
          ...sketchFolder,
        };
        if (typeof copy[property] === 'string') {
          copy[property] = { alma: 'korte' };
        } else {
          copy[property] = 'alma';
        }
        if (property === 'board') {
          console.log();
        }
        assert.strictEqual(isSketchFolder(copy), false);
      })
    );
  });

  let toDispose: vscode.Disposable[];

  beforeEach(() => (toDispose = []));
  afterEach(() => vscode.Disposable.from(...toDispose).dispose());

  describe('update', () => {
    it("should expose the 'update' function", () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      assert.ok(typeof context.update === 'function');
    });

    it('should error when updating with invalid parameters', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      await assert.rejects(
        context.update({ alma: 'korte' }),
        /Error: Invalid state update/
      );
    });

    it('should update the data directory', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      assert.strictEqual(context.dataDirPath, undefined);
      assert.strictEqual(context.config.dataDirPath, undefined);

      const config: CliConfig = {
        dataDirPath: '/path/to/data/dir',
        userDirPath: undefined,
      };
      const event: ChangeEvent<CliConfig> = {
        changedProperties: ['dataDirPath'],
        object: config,
      };
      await context.update(event);
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir');
      assert.strictEqual(context.userDirPath, undefined);
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir');
      assert.strictEqual(context.config.userDirPath, undefined);
    });
  });

  function createOptions() {
    return {
      debug: (message: string) => console.log(message),
      compareBeforeUpdate: () => true,
      state: new InmemoryState(),
    };
  }
});

describe('arduinoContext', () => {
  let arduinoContext: ArduinoContext;
  const toDispose: vscode.Disposable[] = [];

  before(async () => {
    const extension = vscode.extensions.getExtension(extensionId);
    assert.ok(extension);
    await extension?.activate();
    arduinoContext = extension?.exports;
    assert.ok(arduinoContext);
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

  it('should gracefully handle when updating with invalid params', async () => {
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
      assert.ok(actualInspect);
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

    await assert.rejects(update('fqbn', undefined), /Disposed/);
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
