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
  context: vscode.ExtensionContext,
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

interface UpdateHandler {
  update(args: unknown): Promise<unknown>;
}

interface CreateOptions {
  debug(message: string): void;
  compareBeforeUpdate(): boolean;
  readonly state: vscode.Memento;
}

export function createArduinoContext(
  options: CreateOptions
): ArduinoContext & vscode.Disposable & UpdateHandler {
  const { debug, state } = options;
  const _config: CliConfig = { dataDirPath: undefined, userDirPath: undefined };
  const sketchFolders: SketchFolder[] = [];
  const currentSketch: SketchFolder | undefined = undefined;

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
  const updateCliConfig = async (args: UpdateCliConfigParams) => {
    throw new Error('Function not implemented.');
  };

  const update = async (
    key: keyof ArduinoState,
    value: ArduinoState[keyof ArduinoState]
  ) => {
    // the command does not exist if was disposed
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
    config: { dataDirPath: undefined, userDirPath: undefined },
    currentSketch: undefined,
    onDidChangeConfig: _onDidChangeConfig.event,
    onDidChangeCurrentSketch: _onDidChangeCurrentSketch.event,
    onDidChangeSketch: _onDidChangeSketch.event,
    onDidChangeSketchFolders: _onDidChangeSketchFolders.event,
    openedSketches: [],
    update: async function (args: unknown) {
      if (isUpdateStateParams(args)) {
        const { key, value } = args;
        return update(key, value);
      } else if (isUpdateCliConfigParams(args)) {
        return updateCliConfig(args);
      } else {
        let invalidParams = String(args);
        try {
          invalidParams = JSON.stringify(args);
        } catch {}
        throw new Error(`Invalid state update: ${invalidParams}`);
      }
    },
  };
}

// export function isChangeEvent<T>(arg: unknown): arg is ChangeEvent<T> {}

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
/**
 * @deprecated
 */
interface UpdateStateParams {
  readonly key: keyof ArduinoState;
  readonly value: ArduinoState[keyof ArduinoState];
}

type UpdateCliConfigParams = ChangeEvent<CliConfig>;

function isCliConfig(arg: unknown): arg is CliConfig {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    ((<CliConfig>arg).dataDirPath === undefined ||
      typeof (<CliConfig>arg).dataDirPath === 'string') &&
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

type UpdateSketchParams = ChangeEvent<SketchFolder>;

function isSketchFolder(arg: unknown): arg is SketchFolder {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    typeof (<SketchFolder>arg).sketchPath === 'string' &&
    ((<SketchFolder>arg).board === undefined ||
      isBoardIdentifier((<SketchFolder>arg).board) ||
      typeof (<SketchFolder>arg).compileSummary === 'object') &&
    ((<SketchFolder>arg).compileSummary === undefined ||
      typeof (<SketchFolder>arg).compileSummary === 'object') &&
    ((<SketchFolder>arg).port === undefined ||
      typeof (<SketchFolder>arg).port === 'object')
  );
}

function isUpdateSketchParams(arg: unknown): arg is UpdateSketchParams {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    isSketchFolder((<UpdateSketchParams>arg).object) &&
    Array.isArray((<UpdateSketchParams>arg).changedProperties) &&
    (<UpdateSketchParams>arg).changedProperties.every(
      (key) => key in (<UpdateSketchParams>arg).object
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
    ((<UpdateCurrentSketchParams>arg).currentSketch === undefined ||
      isSketchFolder((<UpdateCurrentSketchParams>arg).currentSketch))
  );
}

interface UpdateSketchFoldersParams extends SketchFoldersChangeEvent {
  readonly openedSketches: readonly SketchFolder[];
}

const noopArduinoState: ArduinoState = {
  sketchPath: undefined,
  compileSummary: undefined,
  fqbn: undefined,
  boardDetails: undefined,
  port: undefined,
  userDirPath: undefined,
  dataDirPath: undefined,
} as const;
const arduinoStateKeys = Object.keys(
  noopArduinoState
) as (keyof ArduinoState)[];

function isUpdateStateParams(arg: unknown): arg is UpdateStateParams {
  if (typeof arg === 'object') {
    return (
      (<UpdateStateParams>arg).key !== undefined &&
      typeof (<UpdateStateParams>arg).key === 'string' &&
      arduinoStateKeys.includes((<UpdateStateParams>arg).key) &&
      'value' in <UpdateStateParams>arg // TODO: assert value correctness
    );
  }
  return false;
}

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
  updateStateCommandId,
  defaultConfigValues,
  getWorkspaceConfig,
} as const;
