import { isBoardIdentifier } from 'boards-list';
import assert from 'node:assert/strict';
import { format } from 'node:util';
import vscode from 'vscode';
import type {
  ArduinoContext,
  BoardDetails,
  ChangeEvent,
  CliConfig,
  CompileSummary,
  Port,
  SketchFolder,
  SketchFoldersChangeEvent,
} from '../../api';
import {
  __test,
  activateArduinoContext,
  createArduinoContext,
} from '../../arduinoContext';
import { InmemoryState } from '../../inmemoryState';

const {
  defaultConfigValues,
  getWorkspaceConfig,
  isCliConfig,
  isSketchFolder,
  isUpdateSketchFoldersParams,
  isUpdateSketchParams,
  isBoardDetails,
} = __test;

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

const compileSummary: CompileSummary = {
  buildPath: 'path/to/build/folder',
  usedLibraries: [],
  boardPlatform: undefined,
  buildPlatform: undefined,
  buildProperties: { 'build.tarch': 'xtensa' },
  executableSectionsSize: [],
};

const sketchFolder: SketchFolder = {
  board: boardDetails,
  compileSummary,
  port,
  sketchPath: '/path/to/sketchbook/my_sketch',
};

const initSketchFoldersChangeEvent: SketchFoldersChangeEvent &
  Pick<ArduinoContext, 'openedSketches'> = {
  openedSketches: [sketchFolder],
  addedPaths: [sketchFolder.sketchPath],
  removedPaths: [],
};

describe('arduinoContext', () => {
  describe('isBoardDetails', () => {
    it('should be ok when valid', () => {
      assert.ok(isBoardDetails(boardDetails));
    });

    it('should be ok when name, fqbn, and programmers set', () => {
      assert.ok(
        isBoardDetails({ name: 'ABC', fqbn: 'a:b:c', programmers: [] })
      );
    });

    it('should be false when fqbn is falsy', () => {
      assert.strictEqual(
        isBoardDetails({ name: 'ABC', programmers: [] }),
        false
      );
      assert.strictEqual(
        isBoardDetails({ name: 'ABC', fqbn: undefined, programmers: [] }),
        false
      );
      assert.strictEqual(
        isBoardDetails({ name: 'ABC', fqbn: '', programmers: [] }),
        false
      );
    });
  });

  describe('isUpdateSketchParams', () => {
    it('should be ok when valid', () => {
      const params = {
        object: sketchFolder,
        changedProperties: [...Object.keys(sketchFolder)],
      };
      assert.ok(isUpdateSketchParams(params));
    });

    it('should be ok when changed properties is empty', () => {
      const params = {
        object: sketchFolder,
        changedProperties: [],
      };
      assert.ok(isUpdateSketchParams(params));
    });

    it('should be false when invalid changed properties', () => {
      const params = {
        object: sketchFolder,
        changedProperties: ['alma'],
      };
      assert.strictEqual(isUpdateSketchParams(params), false);
    });
  });

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
      ...initSketchFoldersChangeEvent,
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
      const copy: SketchFolder = {
        ...sketchFolder,
        board: undefined,
      };
      assert.ok(isSketchFolder(copy));
    });

    it("should be ok when the 'board' is a name-only identifier", () => {
      const copy: SketchFolder = {
        ...sketchFolder,
        board: { name: 'ABC', fqbn: undefined },
      };
      assert.ok(isSketchFolder(copy));
    });

    it("should be ok when the 'board' is an identifier", () => {
      const copy: SketchFolder = {
        ...sketchFolder,
        board: { name: 'ABC', fqbn: 'a:b:c' },
      };
      assert.ok(isSketchFolder(copy));
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

    it('should update the data directory path', async () => {
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

      const events: string[] = [];
      toDispose.push(
        context.onDidChange('userDirPath')(() =>
          events.push('deprecated-userDirPath')
        ),
        context.onDidChange('dataDirPath')(() =>
          events.push('deprecated-dataDirPath')
        ),
        context.onDidChangeConfig((event) =>
          events.push(...event.changedProperties)
        )
      );

      await context.update(event);
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir');
      assert.strictEqual(context.userDirPath, undefined);
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir');
      assert.strictEqual(context.config.userDirPath, undefined);
      assert.deepStrictEqual(events, ['deprecated-dataDirPath', 'dataDirPath']);
    });

    it('should update the user directory path', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      assert.strictEqual(context.userDirPath, undefined);
      assert.strictEqual(context.config.userDirPath, undefined);

      const config: CliConfig = {
        dataDirPath: undefined,
        userDirPath: '/path/to/sketchbook',
      };
      const event: ChangeEvent<CliConfig> = {
        changedProperties: ['userDirPath'],
        object: config,
      };

      const events: string[] = [];
      toDispose.push(
        context.onDidChange('userDirPath')(() =>
          events.push('deprecated-userDirPath')
        ),
        context.onDidChange('dataDirPath')(() =>
          events.push('deprecated-dataDirPath')
        ),
        context.onDidChangeConfig((event) =>
          events.push(...event.changedProperties)
        )
      );

      await context.update(event);
      assert.strictEqual(context.dataDirPath, undefined);
      assert.strictEqual(context.userDirPath, '/path/to/sketchbook');
      assert.strictEqual(context.config.dataDirPath, undefined);
      assert.strictEqual(context.config.userDirPath, '/path/to/sketchbook');
      assert.deepStrictEqual(events, ['deprecated-userDirPath', 'userDirPath']);
    });

    it('should update data and the user directory paths', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      assert.strictEqual(context.dataDirPath, undefined);
      assert.strictEqual(context.config.dataDirPath, undefined);
      assert.strictEqual(context.userDirPath, undefined);
      assert.strictEqual(context.config.userDirPath, undefined);

      const config: CliConfig = {
        dataDirPath: '/path/to/data/dir',
        userDirPath: '/path/to/sketchbook',
      };
      const event: ChangeEvent<CliConfig> = {
        changedProperties: ['userDirPath', 'dataDirPath'],
        object: config,
      };

      const events: string[] = [];
      toDispose.push(
        context.onDidChange('userDirPath')(() =>
          events.push('deprecated-userDirPath')
        ),
        context.onDidChange('dataDirPath')(() =>
          events.push('deprecated-dataDirPath')
        ),
        context.onDidChangeConfig((event) =>
          events.push(...event.changedProperties)
        )
      );

      await context.update(event);
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir');
      assert.strictEqual(context.userDirPath, '/path/to/sketchbook');
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir');
      assert.strictEqual(context.config.userDirPath, '/path/to/sketchbook');
      assert.deepStrictEqual(events, [
        'deprecated-userDirPath',
        'deprecated-dataDirPath',
        'userDirPath',
        'dataDirPath',
      ]);
    });

    it("should not update when 'compareBeforeUpdate' is true and values are the same", async () => {
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
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir');

      const events: string[] = [];
      toDispose.push(
        context.onDidChange('dataDirPath')(() =>
          events.push('deprecated-dataDirPath')
        ),
        context.onDidChangeConfig((event) =>
          events.push(...event.changedProperties)
        )
      );

      await context.update(event);
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir');
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir');
      assert.deepStrictEqual(events, []);
    });

    it('should error when updating the current sketch but is not opened', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      await assert.rejects(
        context.update({ currentSketch: sketchFolder }),
        /Error: Illegal state. Sketch is not opened/
      );
    });

    it('should error when updating sketch folders with invalid params (added/remove must be distinct)', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      const params = {
        addedPaths: ['path'],
        openedSketches: [],
        removedPaths: ['path'],
      };
      await assert.rejects(
        context.update(params),
        /Error: Illegal argument. Added\/removed paths must be distinct/
      );
    });

    it('should error when updating sketch folders with invalid params (sketch paths must be unique)', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      const params = {
        addedPaths: [sketchFolder.sketchPath, sketchFolder.sketchPath],
        openedSketches: [sketchFolder, sketchFolder],
        removedPaths: [],
      };
      await assert.rejects(
        context.update(params),
        /Error: Illegal argument. Sketch paths must be unique/
      );
    });

    it('should error when updating sketch folders with invalid params (added path is not in new opened)', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      const params = {
        addedPaths: ['path'],
        openedSketches: [],
        removedPaths: [],
      };
      await assert.rejects(
        context.update(params),
        /Error: Illegal argument. Added path must be in opened sketches/
      );
    });

    it('should error when updating sketch folders with invalid params (removed path is in new opened)', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      const params = {
        addedPaths: [],
        openedSketches: [{ ...sketchFolder, sketchPath: 'path' }],
        removedPaths: ['path'],
      };
      await assert.rejects(
        context.update(params),
        /Error: Illegal argument. Removed path must not be in opened sketches/
      );
    });

    it('should error when updating sketch folders with invalid state (removed path is not in current opened)', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      const params = {
        addedPaths: [],
        openedSketches: [],
        removedPaths: ['path'],
      };
      await assert.rejects(
        context.update(params),
        /Error: Illegal state update. Removed sketch folder was not opened/
      );
    });

    it('should error when updating sketch folders with invalid state (added path is already in current opened)', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      await context.update(initSketchFoldersChangeEvent); // open a sketch folder

      const params = {
        addedPaths: [sketchFolder.sketchPath],
        openedSketches: [sketchFolder],
        removedPaths: [],
      };
      await assert.rejects(
        context.update(params),
        /Error: Illegal state update. Added sketch folder was already opened/
      );
    });

    it('should error when updating with invalid params', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      await assert.rejects(
        context.update({ manó: '♥' }),
        /Invalid params: {"manó":"♥"}/
      );
    });

    it('should gracefully handle when updating with invalid params (non-JSON serializable)', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      const circular = { b: 1, a: 0 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (circular as any).circular = circular;
      await assert.rejects(
        context.update(circular),
        /Invalid params: \[object Object\]/
      );
    });

    interface UpdateSketchTestInput {
      property: keyof SketchFolder;
      value: SketchFolder[keyof SketchFolder];
    }
    interface UpdateSketchTest {
      inputs: UpdateSketchTestInput[];
      expectedEvents: string[];
      testNote?: string;
    }
    const updateTests: UpdateSketchTest[] = [
      {
        inputs: [{ property: 'board', value: undefined }],
        expectedEvents: [`sketch:${sketchFolder.sketchPath}:board`],
        testNote: 'undefined',
      },
      {
        inputs: [
          { property: 'board', value: { name: 'x:y:z', fqbn: undefined } },
        ],
        expectedEvents: [`sketch:${sketchFolder.sketchPath}:board`],
        testNote: 'absent fqbn',
      },
      {
        inputs: [{ property: 'board', value: { name: 'XYZ', fqbn: 'x:y:z' } }],
        expectedEvents: [
          'deprecated-fqbn',
          `sketch:${sketchFolder.sketchPath}:board`,
        ],
        testNote: 'missing platform',
      },
      {
        inputs: [
          {
            property: 'board',
            value: { ...boardDetails, name: 'XYZ', fqbn: 'x:y:z' },
          },
        ],
        expectedEvents: [
          'deprecated-fqbn',
          'deprecated-boardDetails',
          `sketch:${sketchFolder.sketchPath}:board`,
        ],
        testNote: 'complete details',
      },
      {
        inputs: [{ property: 'compileSummary', value: undefined }],
        expectedEvents: [`sketch:${sketchFolder.sketchPath}:compileSummary`],
        testNote: 'undefined',
      },
      {
        inputs: [
          {
            property: 'compileSummary',
            value: {
              ...compileSummary,
              buildProperties: {
                ...compileSummary.buildProperties,
                alma: 'korte',
              },
            },
          },
        ],
        expectedEvents: [
          'deprecated-compileSummary',
          `sketch:${sketchFolder.sketchPath}:compileSummary`,
        ],
      },
      {
        inputs: [{ property: 'port', value: undefined }],
        expectedEvents: [`sketch:${sketchFolder.sketchPath}:port`],
        testNote: 'undefined',
      },
      {
        inputs: [
          {
            property: 'port',
            value: { ...port, address: 'COM2', label: 'COM2 (Serial Port)' },
          },
        ],
        expectedEvents: [
          'deprecated-port',
          `sketch:${sketchFolder.sketchPath}:port`,
        ],
      },
    ];

    updateTests.map(({ inputs, expectedEvents, testNote }) =>
      it(`should update the ${inputs
        .map(({ property }) => `'${property}'`)
        .join(', ')} of the sketch ${
        testNote ? `(${testNote})` : ''
      }`, async () => {
        const events: string[] = [];
        const context = createArduinoContext(createOptions());
        toDispose.push(context);
        assert.strictEqual(context.currentSketch, undefined);
        assert.strictEqual(context.sketchPath, undefined);

        /** @deprecated will be removed */
        const deprecatedEvents: vscode.Disposable[] = [];
        for (const property of inputs.map(({ property }) => property)) {
          // backward compatibility
          if (property === 'board') {
            deprecatedEvents.push(
              context.onDidChange('fqbn')(() => events.push('deprecated-fqbn')),
              context.onDidChange('boardDetails')(() =>
                events.push('deprecated-boardDetails')
              )
            );
          } else {
            deprecatedEvents.push(
              context.onDidChange(property)(() =>
                events.push(`deprecated-${property}`)
              )
            );
          }
        }

        toDispose.push(
          context.onDidChangeCurrentSketch((currentSketch) =>
            events.push(`currentSketch:${currentSketch?.sketchPath}`)
          ),
          context.onDidChangeSketch((event) => {
            events.push(
              `sketch:${event.object.sketchPath}:${event.changedProperties.join(
                ','
              )}`
            );
          }),
          ...deprecatedEvents
        );

        // Open sketch folders
        await context.update(initSketchFoldersChangeEvent);
        // Select the current one
        await context.update({ currentSketch: sketchFolder });
        assert.deepStrictEqual(context.currentSketch, sketchFolder);
        assert.deepStrictEqual(context.openedSketches, [sketchFolder]);
        assert.strictEqual(context.sketchPath, sketchFolder.sketchPath);

        for (const { property, value } of inputs) {
          assert.notDeepStrictEqual(context.currentSketch?.[property], value);

          const copy = { ...sketchFolder };
          (copy as Record<string, unknown>)[property] = value;
          const params: ChangeEvent<SketchFolder> = {
            object: copy,
            changedProperties: [property],
          };

          await context.update(params);
          assert.deepStrictEqual(context.currentSketch?.[property], value);

          // to test backward compatibility
          if (property === 'board') {
            if (isBoardDetails(value)) {
              assert.deepStrictEqual(context.boardDetails, value);
            } else if (isBoardIdentifier(value)) {
              assert.deepStrictEqual(context.fqbn, value.fqbn);
            } else {
              assert.deepStrictEqual(context.fqbn, value);
              assert.deepStrictEqual(context.boardDetails, value);
            }
          } else {
            assert.deepStrictEqual(context[property], value);
          }
        }

        assert.deepStrictEqual(events, [
          `currentSketch:${sketchFolder.sketchPath}`,
          ...expectedEvents,
        ]);
      })
    );
  });

  describe('configuration', () => {
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

    it('should log to the output channel if enabled (arduinoAPI.log)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptions: { dispose(): any }[] = [];
      const mockExtensionContext = { subscriptions };

      const lines: string[] = [];
      const mockOutputChannelFactory = () => {
        const channelMock = {
          appendLine(message: string) {
            lines.push(message);
          },
          dispose() {
            // NOOP
          },
        };
        return channelMock as vscode.OutputChannel;
      };

      const context = activateArduinoContext(
        mockExtensionContext,
        new InmemoryState(),
        mockOutputChannelFactory
      );
      toDispose.push(context, ...subscriptions);

      await updateWorkspaceConfig('log', false);

      await context.update(initSketchFoldersChangeEvent);
      await context.update({ currentSketch: sketchFolder });
      assert.deepStrictEqual(context.currentSketch?.board, sketchFolder.board);

      let params: ChangeEvent<SketchFolder> = {
        object: { ...sketchFolder, board: { name: 'XYZ', fqbn: 'x:y:z' } },
        changedProperties: ['board'],
      };
      await context.update(params);
      assert.deepStrictEqual(context.currentSketch?.board, {
        name: 'XYZ',
        fqbn: 'x:y:z',
      });
      assert.deepStrictEqual(lines, []);

      await updateWorkspaceConfig('log', true);
      params = {
        object: { ...params.object, board: { name: 'QWE', fqbn: 'q:w:e' } },
        changedProperties: ['board'],
      };
      await context.update(params);
      assert.deepStrictEqual(context.currentSketch?.board, {
        name: 'QWE',
        fqbn: 'q:w:e',
      });
      assert.deepStrictEqual(lines, [
        `Updated 'fqbn': "q:w:e"`,
        `Updated 'boardDetails': undefined`,
      ]);
    });

    it('should compare values before update if enabled', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptions: { dispose(): any }[] = [];
      const mockExtensionContext = { subscriptions };

      const mockOutputChannelFactory = () => {
        const channelMock = {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          appendLine(_: string) {
            // NOOP
          },
          dispose() {
            // NOOP
          },
        };
        return channelMock as vscode.OutputChannel;
      };

      const context = activateArduinoContext(
        mockExtensionContext,
        new InmemoryState(),
        mockOutputChannelFactory
      );
      toDispose.push(context, ...subscriptions);

      await updateWorkspaceConfig('compareBeforeUpdate', true);

      await context.update(initSketchFoldersChangeEvent);
      await context.update({ currentSketch: sketchFolder });
      assert.deepStrictEqual(context.currentSketch?.board, sketchFolder.board);

      const events: string[] = [];
      toDispose.push(
        context.onDidChange('fqbn')(() => events.push('deprecated-fqbn')),
        context.onDidChange('boardDetails')(() =>
          events.push('deprecated-boardDetails')
        ),
        context.onDidChangeSketch(({ changedProperties }) =>
          events.push(...changedProperties)
        )
      );

      const params: ChangeEvent<SketchFolder> = {
        object: sketchFolder,
        changedProperties: ['board'],
      };
      await context.update(params);
      assert.deepStrictEqual(events, []);

      await updateWorkspaceConfig('compareBeforeUpdate', false);
      await context.update(params);
      assert.deepStrictEqual(events, [
        'deprecated-fqbn',
        'deprecated-boardDetails',
        'board',
      ]);
    });

    async function updateWorkspaceConfig(
      configKey: ConfigTest['configKey'],
      value: unknown
    ): Promise<void> {
      return vscode.workspace
        .getConfiguration('arduinoAPI')
        .update(configKey, value);
    }
  });

  describe('dispose', () => {
    it('should error when updating after dispose', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      context.dispose();

      await assert.rejects(
        context.update({ currentSketch: sketchFolder }),
        /Disposed/
      );
    });

    it('should be noop when disposing a disposed context', async () => {
      const context = createArduinoContext(createOptions());
      toDispose.push(context);
      context.dispose();
      assert.doesNotThrow(() => context.dispose());
    });
  });

  function createOptions(compare = true) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      debug: (_: string) => {
        /* NOOP */
      },
      compareBeforeUpdate: () => compare,
      state: new InmemoryState(),
    };
  }
});
