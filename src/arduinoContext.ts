import stringify from 'safe-stable-stringify';
import vscode from 'vscode';
import type {
  ArduinoContext,
  ArduinoState,
  BoardDetails,
  CompileSummary,
  Port,
} from './api';

export function createArduinoContext(
  state: vscode.Memento
): ArduinoContext & vscode.Disposable {
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

  // events
  let disposed = false;
  const emitters = createEmitters();
  const onDidChange = createOnDidChange(emitters);
  const toDispose: vscode.Disposable[] = [
    vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
      if (affectsConfiguration('arduinoAPI.log')) {
        updateLog();
      } else if (affectsConfiguration('arduinoAPI.compareBeforeUpdate')) {
        updateCompareBeforeUpdate();
      }
    }),
    new vscode.Disposable(() => logOutput?.dispose()),
    vscode.commands.registerCommand(updateStateCommandId, (args: unknown) => {
      if (isUpdateStateParams(args)) {
        const { key, value } = args;
        return update(key, value);
      } else {
        let invalidParams = String(args);
        try {
          invalidParams = JSON.stringify(args);
        } catch {}
        throw new Error(`Invalid state update: ${invalidParams}`);
      }
    }),
    ...Object.values(emitters),
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
  const update = async (
    key: keyof ArduinoState,
    value: ArduinoState[keyof ArduinoState]
  ) => {
    // the command does not exist if was disposed
    assertNotDisposed();
    if (compareBeforeUpdate) {
      const currentValue = get(key);
      if (stringify(currentValue) === stringify(value)) {
        return;
      }
    }
    await updateState(state, key, value);
    debug(`Updated '${key}': ${JSON.stringify(value)}`);
    emitters[key].fire(value);
  };

  // context
  const arduinoContext: ArduinoContext & vscode.Disposable = {
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
  };
  return arduinoContext;
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
interface UpdateStateParams {
  readonly key: keyof ArduinoState;
  readonly value: ArduinoState[keyof ArduinoState];
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
