import assert from 'node:assert/strict'
import { format } from 'node:util'

import { isBoardIdentifier } from 'boards-list'
import vscode from 'vscode'

import type {
  ArduinoContext,
  BoardDetails,
  ChangeEvent,
  CliConfig,
  CompileSummary,
  Port,
  Programmer,
  SketchFolder,
  SketchFoldersChangeEvent,
} from '../../api'
import {
  __test,
  activateArduinoContext,
  createArduinoContext,
} from '../../arduinoContext'

const {
  defaultConfigValues,
  getWorkspaceConfig,
  isCliConfig,
  isSketchFolder,
  isUpdateSketchFoldersParams,
  isUpdateSketchParams,
  isBoardDetails,
} = __test

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
}

const programmer: Programmer = {
  id: 'p1',
  name: 'P1 Programmer',
  platform: 'my platform',
}

const boardDetails: BoardDetails = {
  configOptions: [],
  fqbn: 'a:b:c',
  name: 'ABC',
  programmers: [programmer, { id: 'two', name: 'two', platform: 'two' }],
  toolsDependencies: [
    { name: 'a', packager: 'a', version: '1' },
    { name: 'b', packager: 'b', version: '2' },
  ],
  buildProperties: { 'build.tarch': 'xtensa', x: 'y' },
  defaultProgrammerId: programmer.id,
}

const compileSummary: CompileSummary = {
  buildPath: 'path/to/build/folder',
  usedLibraries: [],
  boardPlatform: undefined,
  buildPlatform: undefined,
  buildProperties: { 'build.tarch': 'xtensa' },
  executableSectionsSize: [],
}

const sketchFolder: SketchFolder = {
  board: boardDetails,
  compileSummary,
  port,
  sketchPath: '/path/to/sketchbook/my_sketch',
  selectedProgrammer: programmer,
  configOptions: 'a:b:c:opt_1=value1,opt_2=value2',
}

const initSketchFoldersChangeEvent: SketchFoldersChangeEvent &
  Pick<ArduinoContext, 'openedSketches'> = {
  openedSketches: [sketchFolder],
  addedPaths: [sketchFolder.sketchPath],
  removedPaths: [],
}

describe('arduinoContext', () => {
  describe('isBoardDetails', () => {
    it('should be ok when valid', () => {
      assert.ok(isBoardDetails(boardDetails))
    })

    it('should be ok when name, fqbn, and programmers set', () => {
      assert.ok(isBoardDetails({ name: 'ABC', fqbn: 'a:b:c', programmers: [] }))
    })

    it('should be false when fqbn is falsy', () => {
      assert.strictEqual(
        isBoardDetails({ name: 'ABC', programmers: [] }),
        false
      )
      assert.strictEqual(
        isBoardDetails({ name: 'ABC', fqbn: undefined, programmers: [] }),
        false
      )
      assert.strictEqual(
        isBoardDetails({ name: 'ABC', fqbn: '', programmers: [] }),
        false
      )
    })
  })

  describe('isUpdateSketchParams', () => {
    it('should be ok when valid', () => {
      const params = {
        object: sketchFolder,
        changedProperties: [...Object.keys(sketchFolder)],
      }
      assert.ok(isUpdateSketchParams(params))
    })

    it('should be ok when changed properties is empty', () => {
      const params = {
        object: sketchFolder,
        changedProperties: [],
      }
      assert.ok(isUpdateSketchParams(params))
    })

    it('should be false when invalid changed properties', () => {
      const params = {
        object: sketchFolder,
        changedProperties: ['alma'],
      }
      assert.strictEqual(isUpdateSketchParams(params), false)
    })
  })

  describe('isCliConfig', () => {
    ;(
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
    )
  })

  describe('isUpdateSketchFoldersParams', () => {
    const validParams = {
      ...initSketchFoldersChangeEvent,
    }

    it('should be ok when the params is valid', () => {
      assert.ok(isUpdateSketchFoldersParams(validParams))
    })

    Object.keys(validParams).map((property) =>
      it(`should be false when '${property}' is missing`, () => {
        const copy: Record<string, unknown> = {
          ...validParams,
        }
        delete copy[property]
        assert.strictEqual(isUpdateSketchFoldersParams(copy), false)
      })
    )

    Object.keys(validParams).map((property) =>
      it(`should be false when '${property}' has invalid value`, () => {
        const copy: Record<string, unknown> = {
          ...validParams,
        }
        // All props are array at the moment
        copy[property] = [{ alma: 'korte' }]
        assert.strictEqual(isUpdateSketchFoldersParams(copy), false)
      })
    )
  })

  describe('isSketchFolder', () => {
    it("should be ok when the 'board' is undefined", () => {
      const copy: SketchFolder = {
        ...sketchFolder,
        board: undefined,
      }
      assert.ok(isSketchFolder(copy))
    })

    it("should be ok when the 'board' is a name-only identifier", () => {
      const copy: SketchFolder = {
        ...sketchFolder,
        board: { name: 'ABC', fqbn: undefined },
      }
      assert.ok(isSketchFolder(copy))
    })

    it("should be ok when the 'board' is an identifier", () => {
      const copy: SketchFolder = {
        ...sketchFolder,
        board: { name: 'ABC', fqbn: 'a:b:c' },
      }
      assert.ok(isSketchFolder(copy))
    })

    it("should be ok when the 'board' is a complete details", () => {
      assert.ok(isSketchFolder(sketchFolder))
    })

    Object.keys(sketchFolder).map((property) =>
      it(`should be false when '${property}' is missing`, () => {
        const copy: Record<string, unknown> = {
          ...sketchFolder,
        }
        delete copy[property]
        assert.strictEqual(isSketchFolder(copy), false)
      })
    )

    Object.keys(sketchFolder).map((property) =>
      it(`should be false when '${property}' has invalid value`, () => {
        const copy: Record<string, unknown> = {
          ...sketchFolder,
        }
        if ((property as keyof SketchFolder) === 'selectedProgrammer') {
          copy[property] = 36 // selectedProgrammer can be object and string
        } else if (typeof copy[property] === 'string') {
          copy[property] = { alma: 'korte' }
        } else {
          copy[property] = 'alma'
        }
        assert.strictEqual(isSketchFolder(copy), false)
      })
    )
  })

  let toDispose: vscode.Disposable[]

  beforeEach(() => (toDispose = []))
  afterEach(() => vscode.Disposable.from(...toDispose).dispose())

  describe('update', () => {
    it("should expose the 'update' function", () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      assert.ok(typeof context.update === 'function')
    })

    it('should update the data directory path', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      assert.strictEqual(context.dataDirPath, undefined)
      assert.strictEqual(context.config.dataDirPath, undefined)

      const config = {
        dataDirPath: '/path/to/data/dir',
        userDirPath: undefined,
      }
      const event = {
        changedProperties: ['dataDirPath'],
        object: config,
      }

      const events: string[] = []
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
      )

      context.update(event)
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir')
      assert.strictEqual(context.userDirPath, undefined)
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir')
      assert.strictEqual(context.config.userDirPath, undefined)
      assert.deepStrictEqual(events, ['deprecated-dataDirPath', 'dataDirPath'])
    })

    it('should update the user directory path', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      assert.strictEqual(context.userDirPath, undefined)
      assert.strictEqual(context.config.userDirPath, undefined)

      const config = {
        dataDirPath: undefined,
        userDirPath: '/path/to/sketchbook',
      }
      const event = {
        changedProperties: ['userDirPath'],
        object: config,
      }

      const events: string[] = []
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
      )

      context.update(event)
      assert.strictEqual(context.dataDirPath, undefined)
      assert.strictEqual(context.userDirPath, '/path/to/sketchbook')
      assert.strictEqual(context.config.dataDirPath, undefined)
      assert.strictEqual(context.config.userDirPath, '/path/to/sketchbook')
      assert.deepStrictEqual(events, ['deprecated-userDirPath', 'userDirPath'])
    })

    it('should update data and the user directory paths', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      assert.strictEqual(context.dataDirPath, undefined)
      assert.strictEqual(context.config.dataDirPath, undefined)
      assert.strictEqual(context.userDirPath, undefined)
      assert.strictEqual(context.config.userDirPath, undefined)

      const config = {
        dataDirPath: '/path/to/data/dir',
        userDirPath: '/path/to/sketchbook',
      }
      const event = {
        changedProperties: ['userDirPath', 'dataDirPath'],
        object: config,
      }

      const events: string[] = []
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
      )

      context.update(event)
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir')
      assert.strictEqual(context.userDirPath, '/path/to/sketchbook')
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir')
      assert.strictEqual(context.config.userDirPath, '/path/to/sketchbook')
      assert.deepStrictEqual(events, [
        'deprecated-userDirPath',
        'deprecated-dataDirPath',
        'userDirPath',
        'dataDirPath',
      ])
    })

    it("should not update when 'compareBeforeUpdate' is true and values are the same", () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      assert.strictEqual(context.dataDirPath, undefined)
      assert.strictEqual(context.config.dataDirPath, undefined)

      const config: CliConfig = {
        dataDirPath: '/path/to/data/dir',
        userDirPath: undefined,
      }
      const event: ChangeEvent<CliConfig> = {
        changedProperties: ['dataDirPath'],
        object: config,
      }
      context.update(event)
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir')
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir')

      const events: string[] = []
      toDispose.push(
        context.onDidChange('dataDirPath')(() =>
          events.push('deprecated-dataDirPath')
        ),
        context.onDidChangeConfig((event) =>
          events.push(...event.changedProperties)
        )
      )

      context.update(event)
      assert.strictEqual(context.dataDirPath, '/path/to/data/dir')
      assert.strictEqual(context.config.dataDirPath, '/path/to/data/dir')
      assert.deepStrictEqual(events, [])
    })

    it('should error when updating the current sketch but is not opened', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      assert.throws(
        () => context.update({ currentSketch: sketchFolder }),
        /Error: Illegal state. Sketch is not opened/
      )
    })

    it('should error when updating sketch folders with invalid params (added/remove must be distinct)', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      const params = {
        addedPaths: ['path'],
        openedSketches: [],
        removedPaths: ['path'],
      }
      assert.throws(
        () => context.update(params),
        /Error: Illegal argument. Added\/removed paths must be distinct/
      )
    })

    it('should error when updating sketch folders with invalid params (sketch paths must be unique)', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      const params = {
        addedPaths: [sketchFolder.sketchPath, sketchFolder.sketchPath],
        openedSketches: [sketchFolder, sketchFolder],
        removedPaths: [],
      }
      assert.throws(
        () => context.update(params),
        /Error: Illegal argument. Sketch paths must be unique/
      )
    })

    it('should error when updating sketch folders with invalid params (added path is not in new opened)', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      const params = {
        addedPaths: ['path'],
        openedSketches: [],
        removedPaths: [],
      }
      assert.throws(
        () => context.update(params),
        /Error: Illegal argument. Added path must be in opened sketches/
      )
    })

    it('should error when updating sketch folders with invalid params (removed path is in new opened)', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      const params = {
        addedPaths: [],
        openedSketches: [{ ...sketchFolder, sketchPath: 'path' }],
        removedPaths: ['path'],
      }
      assert.throws(
        () => context.update(params),
        /Error: Illegal argument. Removed path must not be in opened sketches/
      )
    })

    it('should error when updating sketch folders with invalid state (removed path is not in current opened)', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      const params = {
        addedPaths: [],
        openedSketches: [],
        removedPaths: ['path'],
      }
      assert.throws(
        () => context.update(params),
        /Error: Illegal state update. Removed sketch folder was not opened/
      )
    })

    it('should error when updating sketch folders with invalid state (added path is already in current opened)', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      context.update(initSketchFoldersChangeEvent) // open a sketch folder

      const params = {
        addedPaths: [sketchFolder.sketchPath],
        openedSketches: [sketchFolder],
        removedPaths: [],
      }
      assert.throws(
        () => context.update(params),
        /Error: Illegal state update. Added sketch folder was already opened/
      )
    })

    it('should error when updating with invalid params', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      assert.throws(
        () => context.update({ manó: '♥' }),
        /Invalid params: {"manó":"♥"}/
      )
    })

    it('should gracefully handle when updating with invalid params (non-JSON serializable)', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      const circular = { b: 1, a: 0 }

      ;(circular as any).circular = circular
      assert.throws(
        () => context.update(circular),
        /Invalid params: \[object Object\]/
      )
    })

    interface UpdateSketchTestInput<
      T extends keyof SketchFolder = keyof SketchFolder,
    > {
      property: T
      inputValue: SketchFolder[T]
      /**
       * If not set, the `inputValue` is used as the expected. Use this while
       * the deprecated APIs are in place.
       */
      expectedValue?: SketchFolder[T]
    }
    interface UpdateSketchTest {
      inputs: UpdateSketchTestInput[]
      expectedEvents: string[]
      testNote?: string
    }
    const updateTests: UpdateSketchTest[] = [
      {
        inputs: [{ property: 'board', inputValue: undefined }],
        expectedEvents: [
          'deprecated-fqbn',
          'deprecated-boardDetails',
          `sketch:${sketchFolder.sketchPath}:board`,
        ],
        testNote: 'undefined',
      },
      {
        inputs: [
          { property: 'board', inputValue: { name: 'x:y:z', fqbn: undefined } },
        ],
        expectedEvents: [
          'deprecated-fqbn',
          'deprecated-boardDetails',
          `sketch:${sketchFolder.sketchPath}:board`,
        ],
        testNote: 'absent fqbn',
      },
      {
        inputs: [
          { property: 'board', inputValue: { name: 'XYZ', fqbn: 'x:y:z' } },
        ],
        expectedEvents: [
          'deprecated-fqbn',
          'deprecated-boardDetails',
          `sketch:${sketchFolder.sketchPath}:board`,
        ],
        testNote: 'missing platform',
      },
      {
        inputs: [
          {
            property: 'board',
            inputValue: { ...boardDetails, name: 'XYZ', fqbn: 'x:y:z' },
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
        inputs: [{ property: 'compileSummary', inputValue: undefined }],
        expectedEvents: [
          'deprecated-compileSummary',
          `sketch:${sketchFolder.sketchPath}:compileSummary`,
        ],
        testNote: 'undefined',
      },
      {
        inputs: [
          {
            property: 'compileSummary',
            inputValue: {
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
        inputs: [{ property: 'port', inputValue: undefined }],
        expectedEvents: [
          'deprecated-port',
          `sketch:${sketchFolder.sketchPath}:port`,
        ],
        testNote: 'undefined',
      },
      {
        inputs: [
          {
            property: 'port',
            inputValue: {
              ...port,
              address: 'COM2',
              label: 'COM2 (Serial Port)',
            },
          },
        ],
        expectedEvents: [
          'deprecated-port',
          `sketch:${sketchFolder.sketchPath}:port`,
        ],
      },
      {
        inputs: [
          {
            property: 'port',
            inputValue: { protocol: port.protocol, address: 'COM2' },
            expectedValue: undefined,
          },
        ],
        expectedEvents: [
          'deprecated-port',
          `sketch:${sketchFolder.sketchPath}:port`,
        ],
        testNote: '(port identifier is undefined via deprecated APIs)',
      },
      {
        inputs: [
          {
            property: 'selectedProgrammer',
            inputValue: 'p2',
          },
        ],
        expectedEvents: [
          `sketch:${sketchFolder.sketchPath}:selectedProgrammer`,
        ],
        testNote: 'string',
      },
      {
        inputs: [
          {
            property: 'selectedProgrammer',
            inputValue: {
              id: 'xxxp',
              name: 'XXX Programmer',
              platform: 'my_platform',
            },
          },
        ],
        expectedEvents: [
          `sketch:${sketchFolder.sketchPath}:selectedProgrammer`,
        ],
        testNote: 'object',
      },
      {
        inputs: [
          {
            property: 'selectedProgrammer',
            inputValue: undefined,
          },
        ],
        expectedEvents: [
          `sketch:${sketchFolder.sketchPath}:selectedProgrammer`,
        ],
        testNote: 'undefined',
      },
    ]

    updateTests.map(({ inputs, expectedEvents, testNote }) =>
      it(`should update the ${inputs
        .map(({ property }) => `'${property}'`)
        .join(', ')} of the sketch ${testNote ? `(${testNote})` : ''}`, () => {
        const events: string[] = []
        const context = createArduinoContext(createOptions())
        toDispose.push(context)
        assert.strictEqual(context.currentSketch, undefined)
        assert.strictEqual(context.sketchPath, undefined)

        /** @deprecated Will be removed */
        const deprecatedEvents: vscode.Disposable[] = []
        for (const property of inputs.map(({ property }) => property)) {
          if (
            property === 'selectedProgrammer' ||
            property === 'configOptions'
          ) {
            continue
          }
          // backward compatibility
          if (property === 'board') {
            deprecatedEvents.push(
              context.onDidChange('fqbn')(() => events.push('deprecated-fqbn')),
              context.onDidChange('boardDetails')(() =>
                events.push('deprecated-boardDetails')
              )
            )
          } else {
            deprecatedEvents.push(
              context.onDidChange(property)(() =>
                events.push(`deprecated-${property}`)
              )
            )
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
            )
          }),
          ...deprecatedEvents
        )

        // Open sketch folders
        context.update(initSketchFoldersChangeEvent)
        // Select the current one
        context.update({ currentSketch: sketchFolder })
        assert.deepStrictEqual(context.currentSketch, sketchFolder)
        assert.deepStrictEqual(context.openedSketches, [sketchFolder])
        assert.strictEqual(context.sketchPath, sketchFolder.sketchPath)

        for (const input of inputs) {
          const { property, inputValue } = input
          const copy = { ...sketchFolder }
          ;(copy as Record<string, unknown>)[property] = inputValue
          const params: ChangeEvent<SketchFolder> = {
            object: copy,
            changedProperties: [property],
          }

          context.update(params)
          assert.deepStrictEqual(context.currentSketch?.[property], inputValue)

          const expectedValue =
            'expectedValue' in input ? input.expectedValue : inputValue
          // to test backward compatibility
          if (
            property !== 'selectedProgrammer' &&
            property !== 'configOptions'
          ) {
            if (property === 'board') {
              if (isBoardDetails(expectedValue)) {
                assert.deepStrictEqual(context.boardDetails, expectedValue)
              } else if (isBoardIdentifier(expectedValue)) {
                assert.deepStrictEqual(context.fqbn, expectedValue.fqbn)
              } else {
                assert.deepStrictEqual(context.fqbn, expectedValue)
                assert.deepStrictEqual(context.boardDetails, expectedValue)
              }
            } else {
              assert.deepStrictEqual(context[property], expectedValue)
            }
          }
        }

        assert.deepStrictEqual(events, [
          `currentSketch:${sketchFolder.sketchPath}`,
          ...expectedEvents,
        ])
      })
    )
  })

  describe('configuration', () => {
    interface ConfigTest {
      readonly configKey: Parameters<typeof getWorkspaceConfig>[0]
      readonly defaultValue: unknown
      readonly testValues: unknown[]
    }
    const testValues: Record<ConfigTest['configKey'], unknown[]> = {
      log: [true, false],
      compareBeforeUpdate: [true, false],
    }
    const configTests: ConfigTest[] = Object.entries(defaultConfigValues).map(
      ([key, value]) => ({
        configKey: key as ConfigTest['configKey'],
        defaultValue: value,
        testValues: testValues[key as ConfigTest['configKey']],
      })
    )

    configTests.map((configTest) =>
      it(`should support the 'arduinoAPI.${configTest.configKey}' configuration`, async () => {
        const { configKey, defaultValue, testValues } = configTest
        await updateWorkspaceConfig(configKey, undefined)
        const actualInspect = vscode.workspace
          .getConfiguration('arduinoAPI')
          .inspect(configKey)
        assert.ok(actualInspect)
        assert.strictEqual(actualInspect?.defaultValue, defaultValue)
        for (const testValue of testValues) {
          await updateWorkspaceConfig(configKey, testValue)
          const actualValue = getWorkspaceConfig(configKey)
          assert.strictEqual(
            actualValue,
            testValue,
            `failed to get expected config value for '${configKey}'`
          )
        }
      })
    )

    it('should log to the output channel if enabled (arduinoAPI.log)', async () => {
      const subscriptions: { dispose(): any }[] = []
      const mockExtensionContext = { subscriptions }

      const lines: string[] = []
      const mockOutputChannelFactory = () => {
        const channelMock = {
          appendLine(message: string) {
            lines.push(message)
          },
          dispose() {
            // NOOP
          },
        }
        return channelMock as vscode.OutputChannel
      }

      const context = activateArduinoContext(
        mockExtensionContext,
        mockOutputChannelFactory
      )
      toDispose.push(context, ...subscriptions)

      await updateWorkspaceConfig('log', false)

      context.update(initSketchFoldersChangeEvent)
      context.update({ currentSketch: sketchFolder })
      assert.deepStrictEqual(context.currentSketch?.board, sketchFolder.board)

      let params: ChangeEvent<SketchFolder> = {
        object: { ...sketchFolder, board: { name: 'XYZ', fqbn: 'x:y:z' } },
        changedProperties: ['board'],
      }
      context.update(params)
      assert.deepStrictEqual(context.currentSketch?.board, {
        name: 'XYZ',
        fqbn: 'x:y:z',
      })
      assert.deepStrictEqual(lines, [])

      await updateWorkspaceConfig('log', true)
      params = {
        object: { ...params.object, board: { name: 'QWE', fqbn: 'q:w:e' } },
        changedProperties: ['board'],
      }
      context.update(params)
      assert.deepStrictEqual(context.currentSketch?.board, {
        name: 'QWE',
        fqbn: 'q:w:e',
      })
      assert.deepStrictEqual(lines, [
        'Updated \'fqbn\': "q:w:e"',
        "Updated 'boardDetails': undefined",
      ])
    })

    it('should compare values before update if enabled', async () => {
      const subscriptions: { dispose(): any }[] = []
      const mockExtensionContext = { subscriptions }

      const mockOutputChannelFactory = () => {
        const channelMock = {
          appendLine(_: string) {
            // NOOP
          },
          dispose() {
            // NOOP
          },
        }
        return channelMock as vscode.OutputChannel
      }

      const context = activateArduinoContext(
        mockExtensionContext,
        mockOutputChannelFactory
      )
      toDispose.push(context, ...subscriptions)

      await updateWorkspaceConfig('compareBeforeUpdate', true)

      context.update(initSketchFoldersChangeEvent)
      context.update({ currentSketch: sketchFolder })
      assert.deepStrictEqual(context.currentSketch?.board, sketchFolder.board)

      const events: string[] = []
      toDispose.push(
        context.onDidChange('fqbn')(() => events.push('deprecated-fqbn')),
        context.onDidChange('boardDetails')(() =>
          events.push('deprecated-boardDetails')
        ),
        context.onDidChangeSketch(({ changedProperties }) =>
          events.push(...changedProperties)
        )
      )

      const params: ChangeEvent<SketchFolder> = {
        object: sketchFolder,
        changedProperties: ['board'],
      }
      context.update(params)
      assert.deepStrictEqual(events, [])

      await updateWorkspaceConfig('compareBeforeUpdate', false)
      context.update(params)
      assert.deepStrictEqual(events, [
        'deprecated-fqbn',
        'deprecated-boardDetails',
        'board',
      ])
    })

    async function updateWorkspaceConfig(
      configKey: ConfigTest['configKey'],
      value: unknown
    ): Promise<void> {
      return vscode.workspace
        .getConfiguration('arduinoAPI')
        .update(configKey, value)
    }
  })

  describe('dispose', () => {
    it('should error when updating after dispose', () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      context.dispose()

      assert.throws(
        () => context.update({ currentSketch: sketchFolder }),
        /Disposed/
      )
    })

    it('should be noop when disposing a disposed context', async () => {
      const context = createArduinoContext(createOptions())
      toDispose.push(context)
      context.dispose()
      assert.doesNotThrow(() => context.dispose())
    })
  })

  function createOptions(compare = true) {
    return {
      debug: (_: string) => {
        /* NOOP */
      },
      compareBeforeUpdate: () => compare,
    }
  }
})
