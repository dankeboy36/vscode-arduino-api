import { isBoardIdentifier } from 'boards-list';
import assert from 'node:assert/strict';
import vscode from 'vscode';
import type {
  ArduinoContext,
  ArduinoState,
  BoardDetails,
  ChangeEvent,
  CliConfig,
  CompileSummary,
  Port,
  SketchFolder,
  SketchFoldersChangeEvent,
} from './api';

export function activateArduinoContext(
  context: Pick<vscode.ExtensionContext, 'subscriptions'>,
  state: vscode.Memento
): ReturnType<typeof createArduinoContext> {
  // config
  let log = false;
  let compareBeforeUpdate = true;
  const updateLog = () => (log = getWorkspaceConfig('log'));
  const updateCompareBeforeUpdate = () =>
    (compareBeforeUpdate = getWorkspaceConfig('compareBeforeUpdate'));
  updateLog();
  updateCompareBeforeUpdate();

  // output channel
  let logOutput: vscode.OutputChannel | undefined = undefined;
  const debug = (message: string) => {
    if (log) {
      if (!logOutput) {
        logOutput = vscode.window.createOutputChannel('Arduino API');
      }
      logOutput.appendLine(message);
    }
  };

  const options = {
    debug,
    state,
    compareBeforeUpdate() {
      return compareBeforeUpdate;
    },
  };
  const arduinoContext = createArduinoContext(options);

  // dispose of commands
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
      if (affectsConfiguration('arduinoAPI.log')) {
        updateLog();
      } else if (affectsConfiguration('arduinoAPI.compareBeforeUpdate')) {
        updateCompareBeforeUpdate();
      }
    }),
    new vscode.Disposable(() => logOutput?.dispose()),
    vscode.commands.registerCommand(updateStateCommandId, arduinoContext.update)
  );

  return arduinoContext;
}

interface CreateOptions {
  debug(message: string): void;
  compareBeforeUpdate(): boolean;
  readonly state: vscode.Memento;
}

export function createArduinoContext(
  options: CreateOptions
): ArduinoContext &
  vscode.Disposable & { update(args: unknown): Promise<unknown> } {
  const { debug, state } = options;

  // events
  let disposed = false;
  const _onDidChangeCurrentSketch = new vscode.EventEmitter<
    SketchFolder | undefined
  >();
  const _onDidChangeSketchFolders =
    new vscode.EventEmitter<SketchFoldersChangeEvent>();
  const _onDidChangeSketch = new vscode.EventEmitter<
    ChangeEvent<SketchFolder>
  >();
  const _onDidChangeConfig = new vscode.EventEmitter<ChangeEvent<CliConfig>>();
  /** @deprecated should be removed */
  const emitters = createEmitters();
  const onDidChange = createOnDidChange(emitters);
  const toDispose: vscode.Disposable[] = [
    ...Object.values(emitters),
    _onDidChangeCurrentSketch,
    _onDidChangeSketchFolders,
    _onDidChangeSketch,
    _onDidChangeConfig,
  ];

  // state
  const assertNotDisposed = () => {
    if (disposed) {
      throw new Error('Disposed');
    }
  };
  const get = <T>(key: keyof ArduinoState) => {
    assertNotDisposed();
    return <T>getState(state, key);
  };
  const hasChanged = <T>(event: ChangeEvent<T>, currentObject: T | undefined) =>
    event.changedProperties.some((property) => {
      const newValue = event.object[property];
      const currentValue = currentObject?.[property];
      return !deepStrictEqual(currentValue, newValue);
    });

  let _openedSketches: SketchFolder[] = [];
  const isOpenedSketch = (
    sketchPath: string,
    openedSketches: readonly SketchFolder[] = _openedSketches
  ) => {
    const sketchUri = vscode.Uri.file(sketchPath).toString();
    const match = openedSketches
      .map(({ sketchPath }) => vscode.Uri.file(sketchPath).toString())
      .find((openedUri) => openedUri === sketchUri);
    return Boolean(match);
  };
  const assertIsOpened = (sketch: SketchFolder | string | undefined) => {
    const sketchPath = typeof sketch === 'string' ? sketch : sketch?.sketchPath;
    if (sketchPath && !isOpenedSketch(sketchPath)) {
      throw new Error(
        `Illegal state. Sketch is not opened: ${sketchPath}. Opened sketches: ${JSON.stringify(
          _openedSketches
        )}`
      );
    }
  };

  let _cliConfig: CliConfig | undefined = undefined;
  let _currentSketch: SketchFolder | undefined = undefined;
  const updateCliConfig = async (params: UpdateCliConfigParams) => {
    const changed =
      !options.compareBeforeUpdate() || hasChanged(params, _cliConfig);
    if (changed) {
      // TODO: remove old notifications
      await Promise.all(
        params.changedProperties.map((property) =>
          update(property, params.object[property])
        )
      );

      _cliConfig = params.object;
      _onDidChangeConfig.fire(params);
    }
  };
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
      );
    }
    const distinctSketchPaths = new Set(
      params.openedSketches.map(({ sketchPath }) => sketchPath)
    );
    if (distinctSketchPaths.size !== params.openedSketches.length) {
      throw new Error(
        `Illegal argument. Sketch paths must be unique: ${JSON.stringify(
          params
        )}`
      );
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
      );
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
      );
    }
    if (
      !params.removedPaths.every((sketchPath) => isOpenedSketch(sketchPath))
    ) {
      throw new Error(
        `Illegal state update. Removed sketch folder was not opened: ${JSON.stringify(
          params
        )}, opened sketches: ${JSON.stringify(_openedSketches)}`
      );
    }
    if (params.addedPaths.some((sketchPath) => isOpenedSketch(sketchPath))) {
      throw new Error(
        `Illegal state update. Added sketch folder was already opened: ${JSON.stringify(
          params
        )}, opened sketches: ${JSON.stringify(_openedSketches)}`
      );
    }
    _openedSketches = params.openedSketches.slice();
    _onDidChangeSketchFolders.fire({
      addedPaths: params.addedPaths,
      removedPaths: params.removedPaths,
    });
  };
  const updateCurrentSketch = async (params: UpdateCurrentSketchParams) => {
    assertIsOpened(params.currentSketch);
    await update('sketchPath', params.currentSketch?.sketchPath);
    _currentSketch = params.currentSketch;
    _onDidChangeCurrentSketch.fire(_currentSketch);
  };
  const updateSketch = async (params: UpdateSketchParam) => {
    assertIsOpened(params.object);
    const changed =
      options.compareBeforeUpdate() || hasChanged(params, _currentSketch);
    if (changed) {
      // TODO: remove old notifications
      await Promise.all(
        params.changedProperties.map((property) => {
          // backward compatibility between board vs. fqbn+boardDetails
          if (property === 'board') {
            const newValue = params.object[property];
            if (!newValue) {
              return Promise.all([
                update('fqbn', undefined),
                update('boardDetails', undefined),
              ]);
            } else if (isBoardDetails(newValue)) {
              return Promise.all([
                update('fqbn', newValue.fqbn),
                update('boardDetails', newValue),
              ]);
            } else {
              return Promise.all([
                update('fqbn', newValue.fqbn),
                update('boardDetails', undefined),
              ]);
            }
          }
          return update(property, params.object[property]);
        })
      );

      _currentSketch = params.object;
      _onDidChangeSketch.fire(params);
    }
  };

  /** @deprecated will be removed */
  const update = async (
    key: keyof ArduinoState,
    value: ArduinoState[keyof ArduinoState]
  ) => {
    assertNotDisposed();
    if (options.compareBeforeUpdate()) {
      const currentValue = get(key);
      try {
        assert.deepStrictEqual(currentValue, value);
        return;
      } catch {}
    }
    await updateState(state, key, value);
    debug(`Updated '${key}': ${JSON.stringify(value)}`);
    emitters[key].fire(value);
  };

  // context
  return {
    onDidChange<T extends keyof ArduinoState>(property: T) {
      return onDidChange[property] as vscode.Event<ArduinoState[T]>;
    },
    get sketchPath() {
      return get<string>('sketchPath');
    },
    get compileSummary() {
      return get<CompileSummary>('compileSummary');
    },
    get fqbn() {
      return get<string>('fqbn');
    },
    get boardDetails() {
      return get<BoardDetails>('boardDetails');
    },
    get port() {
      return get<Port>('port');
    },
    get userDirPath() {
      return get<string>('userDirPath');
    },
    get dataDirPath() {
      return get<string>('dataDirPath');
    },
    dispose(): void {
      if (disposed) {
        return;
      }
      vscode.Disposable.from(...toDispose).dispose();
      disposed = true;
    },
    // multi-sketch
    get config() {
      return _cliConfig ?? { userDirPath: undefined, dataDirPath: undefined };
    },
    get currentSketch() {
      return _currentSketch;
    },
    onDidChangeConfig: _onDidChangeConfig.event,
    onDidChangeCurrentSketch: _onDidChangeCurrentSketch.event,
    onDidChangeSketch: _onDidChangeSketch.event,
    onDidChangeSketchFolders: _onDidChangeSketchFolders.event,
    get openedSketches() {
      return _openedSketches;
    },
    update: async function (args: unknown) {
      assertNotDisposed();
      if (isUpdateCliConfigParams(args)) {
        return updateCliConfig(args);
      } else if (isUpdateCurrentSketchParams(args)) {
        return updateCurrentSketch(args);
      } else if (isUpdateSketchFoldersParams(args)) {
        return updateSketchFolders(args);
      } else if (isUpdateSketchParams(args)) {
        return updateSketch(args);
      } else {
        let invalidParams = String(args);
        try {
          invalidParams = JSON.stringify(args);
        } catch {}
        throw new Error(`Invalid params: ${invalidParams}`);
      }
    },
  };
}

function deepStrictEqual(left: unknown, right: unknown): boolean {
  try {
    assert.deepStrictEqual(left, right);
    return true;
  } catch {
    return false;
  }
}

function createOnDidChange(
  emitters: ReturnType<typeof createEmitters>
): Record<keyof ArduinoState, vscode.Event<ArduinoState[keyof ArduinoState]>> {
  const record = <
    Record<keyof ArduinoState, vscode.Event<ArduinoState[keyof ArduinoState]>>
  >{};
  return Object.entries(emitters).reduce((acc, [name, value]) => {
    const key = <keyof ArduinoState>name;
    acc[key] = value.event;
    return acc;
  }, record);
}

function createEmitters(): Record<
  keyof ArduinoState,
  vscode.EventEmitter<ArduinoState[keyof ArduinoState]>
> {
  return arduinoStateKeys.reduce((acc, key) => {
    acc[key] = new vscode.EventEmitter();
    return acc;
  }, <Record<keyof ArduinoState, vscode.EventEmitter<ArduinoState[keyof ArduinoState]>>>{});
}

function getState<T>(
  state: vscode.Memento,
  key: keyof ArduinoContext
): T | undefined {
  return state.get<T>(key);
}

async function updateState(
  state: vscode.Memento,
  key: keyof ArduinoState,
  value: ArduinoState[keyof ArduinoState]
): Promise<void> {
  return state.update(key, value);
}

const updateStateCommandId = 'arduinoAPI.updateState';

type UpdateCliConfigParams = ChangeEvent<CliConfig>;

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
  );
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
  );
}

type UpdateSketchParam = ChangeEvent<SketchFolder>;

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
      typeof (<SketchFolder>arg).port === 'object')
  );
}

function isBoardDetails(arg: unknown): arg is BoardDetails {
  return (
    isBoardIdentifier(arg) &&
    !!arg.fqbn &&
    'programmers' in arg &&
    Array.isArray((<BoardDetails>arg).programmers)
  );
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
  );
}

interface UpdateCurrentSketchParams {
  readonly currentSketch: SketchFolder | undefined;
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
  );
}

interface UpdateSketchFoldersParams extends SketchFoldersChangeEvent {
  readonly openedSketches: readonly SketchFolder[];
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
  );
}

/** @deprecated will be removed */
const noopArduinoState: ArduinoState = {
  sketchPath: undefined,
  compileSummary: undefined,
  fqbn: undefined,
  boardDetails: undefined,
  port: undefined,
  userDirPath: undefined,
  dataDirPath: undefined,
} as const;
/** @deprecated will be removed */
const arduinoStateKeys = Object.keys(
  noopArduinoState
) as (keyof ArduinoState)[];

const configKeys = ['log', 'compareBeforeUpdate'] as const;
type ConfigKey = (typeof configKeys)[number];
const defaultConfigValues = {
  log: false,
  compareBeforeUpdate: true,
} as const;

function getWorkspaceConfig<T>(configKey: ConfigKey): T {
  const defaultValue = defaultConfigValues[configKey];
  return vscode.workspace
    .getConfiguration('arduinoAPI')
    .get<T>(configKey, defaultValue as unknown as T);
}

/**
 * (non-API)
 */
export const __test = {
  defaultConfigValues,
  getWorkspaceConfig,
  isCliConfig,
  isSketchFolder,
  isUpdateSketchFoldersParams,
  isUpdateSketchParams,
  isBoardDetails,
} as const;
