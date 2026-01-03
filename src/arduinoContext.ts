import assert from 'node:assert/strict'

import {
  PortIdentifier,
  isBoardIdentifier,
  isPortIdentifier,
} from 'boards-list'
import vscode from 'vscode'

import type {
  ArduinoContext,
  ArduinoState,
  BoardDetails,
  ChangeEvent,
  CliConfig,
  Port,
  Programmer,
  SketchFolder,
  SketchFoldersChangeEvent,
} from './api'

export function activateArduinoContext(
  context: Pick<vscode.ExtensionContext, 'subscriptions'>,
  outputChannelFactory: () => vscode.OutputChannel
): ReturnType<typeof createArduinoContext> {
  // config
  let log = false
  let compareBeforeUpdate = true
  const updateLog = () => (log = getWorkspaceConfig('log'))
  const updateCompareBeforeUpdate = () =>
    (compareBeforeUpdate = getWorkspaceConfig('compareBeforeUpdate'))
  updateLog()
  updateCompareBeforeUpdate()

  // output channel
  let logOutput: vscode.OutputChannel | undefined
  const debug = (message: string) => {
    if (log) {
      if (!logOutput) {
        logOutput = outputChannelFactory()
      }
      logOutput.appendLine(message)
    }
  }

  const options = {
    debug,
    compareBeforeUpdate() {
      return compareBeforeUpdate
    },
  }
  const arduinoContext = createArduinoContext(options)

  // dispose config change listener and output channel (if opened)
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
      if (affectsConfiguration('arduinoAPI.log')) {
        updateLog()
      }
      if (affectsConfiguration('arduinoAPI.compareBeforeUpdate')) {
        updateCompareBeforeUpdate()
      }
    }),
    new vscode.Disposable(() => logOutput?.dispose())
  )

  return arduinoContext
}

interface CreateOptions {
  debug(message: string): void
  compareBeforeUpdate(): boolean
}

export function createArduinoContext(
  options: CreateOptions
): ArduinoContext & vscode.Disposable & { update(args: unknown): unknown } {
  const { debug } = options
  // events
  let disposed = false
  const _onDidChangeCurrentSketch = new vscode.EventEmitter<
    SketchFolder | undefined
  >()
  const _onDidChangeSketchFolders =
    new vscode.EventEmitter<SketchFoldersChangeEvent>()
  const _onDidChangeSketch = new vscode.EventEmitter<
    ChangeEvent<SketchFolder>
  >()
  const _onDidChangeConfig = new vscode.EventEmitter<ChangeEvent<CliConfig>>()
  /** @deprecated Should be removed */
  const emitters = createEmitters()
  const onDidChange = createOnDidChange(emitters)
  const toDispose: vscode.Disposable[] = [
    ...Object.values(emitters),
    _onDidChangeCurrentSketch,
    _onDidChangeSketchFolders,
    _onDidChangeSketch,
    _onDidChangeConfig,
  ]

  // state
  const assertNotDisposed = () => {
    if (disposed) {
      throw new Error('Disposed')
    }
  }
  const hasChanged = <T>(event: ChangeEvent<T>, currentObject: T | undefined) =>
    event.changedProperties.some((property) => {
      const newValue = event.object[property]
      const currentValue = currentObject?.[property]
      return !deepStrictEqual(currentValue, newValue)
    })

  let _openedSketches: SketchFolder[] = []
  const isOpenedSketch = (
    sketchPath: string,
    openedSketches: readonly SketchFolder[] = _openedSketches
  ) => {
    const sketchUri = vscode.Uri.file(sketchPath).toString()
    const match = openedSketches
      .map(({ sketchPath }) => vscode.Uri.file(sketchPath).toString())
      .find((openedUri) => openedUri === sketchUri)
    return Boolean(match)
  }
  const assertIsOpened = (sketch: SketchFolder | undefined) => {
    if (sketch && !isOpenedSketch(sketch.sketchPath)) {
      throw new Error(
        `Illegal state. Sketch is not opened: ${
          sketch.sketchPath
        }. Opened sketches: ${JSON.stringify(_openedSketches)}`
      )
    }
  }

  let _cliConfig: CliConfig | undefined
  let _currentSketch: SketchFolder | undefined
  const updateCliConfig = (params: UpdateCliConfigParams) => {
    const changed =
      !options.compareBeforeUpdate() || hasChanged(params, _cliConfig)
    if (changed) {
      // update value
      _cliConfig = params.object

      // TODO: remove old notifications
      // emit deprecated events
      for (const property of params.changedProperties) {
        emitDeprecatedEvent(property, params.object[property])
      }
      // emit new API events
      _onDidChangeConfig.fire(params)
    }
  }
  const updateSketchFolders = (params: UpdateSketchFoldersParams) => {
    if (
      params.addedPaths.some((sketchPath) =>
        params.removedPaths.includes(sketchPath)
      )
    ) {
      throw new Error(
        `Illegal argument. Added/removed paths must be distinct: ${JSON.stringify(
          params
        )}`
      )
    }
    const distinctSketchPaths = new Set(
      params.openedSketches.map(({ sketchPath }) => sketchPath)
    )
    if (distinctSketchPaths.size !== params.openedSketches.length) {
      throw new Error(
        `Illegal argument. Sketch paths must be unique: ${JSON.stringify(
          params
        )}`
      )
    }
    if (
      !params.addedPaths.every((sketchPath) =>
        isOpenedSketch(sketchPath, params.openedSketches)
      )
    ) {
      throw new Error(
        `Illegal argument. Added path must be in opened sketches: ${JSON.stringify(
          params
        )}`
      )
    }
    if (
      params.removedPaths.some((sketchPath) =>
        isOpenedSketch(sketchPath, params.openedSketches)
      )
    ) {
      throw new Error(
        `Illegal argument. Removed path must not be in opened sketches: ${JSON.stringify(
          params
        )}`
      )
    }
    if (
      !params.removedPaths.every((sketchPath) => isOpenedSketch(sketchPath))
    ) {
      throw new Error(
        `Illegal state update. Removed sketch folder was not opened: ${JSON.stringify(
          params
        )}, opened sketches: ${JSON.stringify(_openedSketches)}`
      )
    }
    if (params.addedPaths.some((sketchPath) => isOpenedSketch(sketchPath))) {
      throw new Error(
        `Illegal state update. Added sketch folder was already opened: ${JSON.stringify(
          params
        )}, opened sketches: ${JSON.stringify(_openedSketches)}`
      )
    }
    _openedSketches = params.openedSketches.slice()
    _onDidChangeSketchFolders.fire({
      addedPaths: params.addedPaths,
      removedPaths: params.removedPaths,
    })
  }
  const updateCurrentSketch = (params: UpdateCurrentSketchParams) => {
    assertIsOpened(params.currentSketch)
    emitDeprecatedEvent('sketchPath', params.currentSketch?.sketchPath)
    _currentSketch = params.currentSketch
    _onDidChangeCurrentSketch.fire(_currentSketch)
  }
  const updateSketch = (params: UpdateSketchParam) => {
    assertIsOpened(params.object)
    const changed =
      !options.compareBeforeUpdate() || hasChanged(params, _currentSketch)
    if (changed) {
      // set value
      _currentSketch = params.object

      // emit deprecated events
      // TODO: remove old notifications
      for (const property of params.changedProperties) {
        if (property === 'selectedProgrammer' || property === 'configOptions') {
          // https://github.com/dankeboy36/vscode-arduino-api/issues/13
          // new properties are not required for old APIs
          continue
        }

        // backward compatibility between board vs. fqbn+boardDetails
        if (property === 'board') {
          const newValue = params.object[property]
          if (!newValue) {
            emitDeprecatedEvent('fqbn', undefined)
            emitDeprecatedEvent('boardDetails', undefined)
          } else if (isBoardDetails(newValue)) {
            emitDeprecatedEvent('fqbn', newValue.fqbn)
            emitDeprecatedEvent('boardDetails', newValue)
          } else {
            emitDeprecatedEvent('fqbn', newValue.fqbn)
            emitDeprecatedEvent('boardDetails', undefined)
          }
          continue
        }

        if (property === 'port') {
          const port = params.object.port
          // https://github.com/dankeboy36/vscode-arduino-api/issues/13
          // if the new port value is set but not a complete detected port object, skip the update
          if (!port || isDetectedPort(port)) {
            emitDeprecatedEvent(property, port)
          } else {
            emitDeprecatedEvent('port', undefined)
          }
        } else {
          emitDeprecatedEvent(property, params.object[property])
        }
      }

      // emit new events
      _onDidChangeSketch.fire(params)
    }
  }

  /** @deprecated Will be removed */
  const emitDeprecatedEvent = (
    key: keyof ArduinoState,
    newValue: ArduinoState[keyof ArduinoState]
  ) => {
    assertNotDisposed()
    debug(`Updated '${key}': ${JSON.stringify(newValue)}`)
    emitters[key].fire(newValue)
  }

  // context
  return {
    onDidChange<T extends keyof ArduinoState>(property: T) {
      return onDidChange[property] as vscode.Event<ArduinoState[T]>
    },
    get sketchPath() {
      return _currentSketch?.sketchPath
    },
    get compileSummary() {
      return _currentSketch?.compileSummary
    },
    get fqbn() {
      return _currentSketch?.board?.fqbn
    },
    get boardDetails() {
      const board = _currentSketch?.board
      if (board && !isBoardDetails(board)) {
        return undefined
      }
      return board
    },
    get port() {
      const port = _currentSketch?.port
      if (port && !isDetectedPort(port)) {
        return undefined
      }
      return port
    },
    get userDirPath() {
      return _cliConfig?.userDirPath
    },
    get dataDirPath() {
      return _cliConfig?.dataDirPath
    },
    dispose(): void {
      if (disposed) {
        return
      }
      vscode.Disposable.from(...toDispose).dispose()
      disposed = true
    },
    // multi-sketch
    get config() {
      return _cliConfig ?? { userDirPath: undefined, dataDirPath: undefined }
    },
    get currentSketch() {
      return _currentSketch
    },
    onDidChangeConfig: _onDidChangeConfig.event,
    onDidChangeCurrentSketch: _onDidChangeCurrentSketch.event,
    onDidChangeSketch: _onDidChangeSketch.event,
    onDidChangeSketchFolders: _onDidChangeSketchFolders.event,
    get openedSketches() {
      return _openedSketches
    },
    update: function (args: unknown) {
      assertNotDisposed()
      if (isUpdateCliConfigParams(args)) {
        return updateCliConfig(args)
      } else if (isUpdateCurrentSketchParams(args)) {
        return updateCurrentSketch(args)
      } else if (isUpdateSketchFoldersParams(args)) {
        return updateSketchFolders(args)
      } else if (isUpdateSketchParams(args)) {
        return updateSketch(args)
      } else {
        let invalidParams = String(args)
        try {
          invalidParams = JSON.stringify(args)
        } catch {}
        throw new Error(`Invalid params: ${invalidParams}`)
      }
    },
  }
}

function deepStrictEqual(left: unknown, right: unknown): boolean {
  try {
    assert.deepStrictEqual(left, right)
    return true
  } catch {
    return false
  }
}

function createOnDidChange(
  emitters: ReturnType<typeof createEmitters>
): Record<keyof ArduinoState, vscode.Event<ArduinoState[keyof ArduinoState]>> {
  const record = <
    Record<keyof ArduinoState, vscode.Event<ArduinoState[keyof ArduinoState]>>
  >{}
  return Object.entries(emitters).reduce((acc, [name, value]) => {
    const key = <keyof ArduinoState>name
    acc[key] = value.event
    return acc
  }, record)
}

function createEmitters(): Record<
  keyof ArduinoState,
  vscode.EventEmitter<ArduinoState[keyof ArduinoState]>
> {
  return arduinoStateKeys.reduce(
    (acc, key) => {
      acc[key] = new vscode.EventEmitter()
      return acc
    },
    <
      Record<
        keyof ArduinoState,
        vscode.EventEmitter<ArduinoState[keyof ArduinoState]>
      >
    >{}
  )
}

type UpdateCliConfigParams = ChangeEvent<CliConfig>

function isCliConfig(arg: unknown): arg is CliConfig {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'dataDirPath' in arg &&
    ((<CliConfig>arg).dataDirPath === undefined ||
      typeof (<CliConfig>arg).dataDirPath === 'string') &&
    'userDirPath' in arg &&
    ((<CliConfig>arg).userDirPath === undefined ||
      typeof (<CliConfig>arg).userDirPath === 'string')
  )
}

function isUpdateCliConfigParams(arg: unknown): arg is UpdateCliConfigParams {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    isCliConfig((<UpdateCliConfigParams>arg).object) &&
    Array.isArray((<UpdateCliConfigParams>arg).changedProperties) &&
    (<UpdateCliConfigParams>arg).changedProperties.every(
      (key) => key in (<UpdateCliConfigParams>arg).object
    )
  )
}

type UpdateSketchParam = ChangeEvent<SketchFolder>

function isSketchFolder(arg: unknown): arg is SketchFolder {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    typeof (<SketchFolder>arg).sketchPath === 'string' &&
    'board' in arg &&
    ((<SketchFolder>arg).board === undefined ||
      isBoardIdentifier((<SketchFolder>arg).board) ||
      typeof (<SketchFolder>arg).board === 'object') &&
    'compileSummary' in arg &&
    ((<SketchFolder>arg).compileSummary === undefined ||
      typeof (<SketchFolder>arg).compileSummary === 'object') &&
    'port' in arg &&
    ((<SketchFolder>arg).port === undefined ||
      typeof (<SketchFolder>arg).port === 'object') &&
    'selectedProgrammer' in arg &&
    ((<SketchFolder>arg).selectedProgrammer === undefined ||
      typeof (<SketchFolder>arg).selectedProgrammer === 'string' ||
      isProgrammer((<SketchFolder>arg).selectedProgrammer)) &&
    'configOptions' in arg &&
    ((<SketchFolder>arg).configOptions === undefined ||
      typeof (<SketchFolder>arg).configOptions === 'string')
  )
}

function isProgrammer(arg: unknown): arg is Programmer {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    typeof (<Programmer>arg).id === 'string' &&
    typeof (<Programmer>arg).name === 'string' &&
    typeof (<Programmer>arg).platform === 'string'
  )
}

function isDetectedPort(port: PortIdentifier | Port): port is Port {
  return isPortIdentifier(port) && typeof (<Port>port).label === 'string'
}

function isBoardDetails(arg: unknown): arg is BoardDetails {
  return (
    isBoardIdentifier(arg) &&
    !!arg.fqbn &&
    'programmers' in arg &&
    Array.isArray((<BoardDetails>arg).programmers)
  )
}

function isUpdateSketchParams(arg: unknown): arg is UpdateSketchParam {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    isSketchFolder((<UpdateSketchParam>arg).object) &&
    Array.isArray((<UpdateSketchParam>arg).changedProperties) &&
    (<UpdateSketchParam>arg).changedProperties.every(
      (key) => key in (<UpdateSketchParam>arg).object
    )
  )
}

interface UpdateCurrentSketchParams {
  readonly currentSketch: SketchFolder | undefined
}

function isUpdateCurrentSketchParams(
  arg: unknown
): arg is UpdateCurrentSketchParams {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'currentSketch' in arg &&
    ((<UpdateCurrentSketchParams>arg).currentSketch === undefined ||
      isSketchFolder((<UpdateCurrentSketchParams>arg).currentSketch))
  )
}

interface UpdateSketchFoldersParams extends SketchFoldersChangeEvent {
  readonly openedSketches: readonly SketchFolder[]
}

function isUpdateSketchFoldersParams(
  arg: unknown
): arg is UpdateSketchFoldersParams {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    Array.isArray((<UpdateSketchFoldersParams>arg).openedSketches) &&
    (<UpdateSketchFoldersParams>arg).openedSketches.every(isSketchFolder) &&
    Array.isArray((<UpdateSketchFoldersParams>arg).addedPaths) &&
    (<UpdateSketchFoldersParams>arg).addedPaths.every(
      (path) => typeof path === 'string'
    ) &&
    Array.isArray((<UpdateSketchFoldersParams>arg).removedPaths) &&
    (<UpdateSketchFoldersParams>arg).removedPaths.every(
      (path) => typeof path === 'string'
    )
  )
}

/** @deprecated Will be removed */
const noopArduinoState: ArduinoState = {
  sketchPath: undefined,
  compileSummary: undefined,
  fqbn: undefined,
  boardDetails: undefined,
  port: undefined,
  userDirPath: undefined,
  dataDirPath: undefined,
} as const
/** @deprecated Will be removed */
const arduinoStateKeys = Object.keys(noopArduinoState) as (keyof ArduinoState)[]

const defaultConfigValues = {
  log: false,
  compareBeforeUpdate: true,
} as const
type ConfigKey = keyof typeof defaultConfigValues

function getWorkspaceConfig<T>(configKey: ConfigKey): T {
  const defaultValue = defaultConfigValues[configKey]
  return vscode.workspace
    .getConfiguration('arduinoAPI')
    .get<T>(configKey, defaultValue as unknown as T)
}

/** (non-API) */
export const __test = {
  defaultConfigValues,
  getWorkspaceConfig,
  isCliConfig,
  isSketchFolder,
  isUpdateSketchFoldersParams,
  isUpdateSketchParams,
  isBoardDetails,
} as const
