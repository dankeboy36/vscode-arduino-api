import * as vscode from 'vscode';
import type { ArduinoContext, ArduinoState, BoardDetails, Port } from './api';

export function createArduinoContext(
  workspaceState: vscode.Memento
): ArduinoContext & vscode.Disposable {
  let debugOutput: vscode.OutputChannel | undefined = undefined;
  const log = (message: string) => {
    if (!debugOutput) {
      debugOutput = vscode.window.createOutputChannel('VS Code Arduino API');
    }
    debugOutput.appendLine(message);
  };
  const get = <T>(key: keyof ArduinoState) => <T>getState(workspaceState, key);
  const update = async (
    key: keyof ArduinoState,
    value: ArduinoState[keyof ArduinoState]
  ) => {
    await updateState(workspaceState, key, value);
    log(`Updated state of '${key}': ${JSON.stringify(value)}`);
    emitters[key].fire(value);
  };
  const emitters = createEmitters();
  const onDidChange = createOnDidChange(emitters);
  const toDispose: vscode.Disposable[] = [
    new vscode.Disposable(() => debugOutput?.dispose()),
    vscode.commands.registerCommand(updateStateCommandId, (args: unknown) => {
      if (isUpdateStateParams(args)) {
        const { key, value } = args;
        return update(key, value);
      } else {
        let invalidParams = String(args);
        try {
          invalidParams = JSON.stringify(args);
        } catch {}
        log(`Ignored invalid state update: ${invalidParams}`);
      }
    }),
    ...Object.values(emitters),
  ];
  const arduinoContext: ArduinoContext & vscode.Disposable = {
    get onDidChange() {
      return onDidChange;
    },
    get sketchPath() {
      return get<string>('sketchPath');
    },
    get buildPath() {
      return get<string>('buildPath');
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
      vscode.Disposable.from(...toDispose).dispose();
    },
  };
  return arduinoContext;
}

function createOnDidChange(
  emitters: ReturnType<typeof createEmitters>
): Record<keyof ArduinoState, vscode.Event<ArduinoState[keyof ArduinoState]>> {
  const record = <
    Record<
      keyof ArduinoState,
      vscode.Event<string | BoardDetails | Port | undefined>
    >
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
  workspaceState: vscode.Memento,
  key: keyof ArduinoContext
): T | undefined {
  return workspaceState.get<T>(key);
}

/**
 * (non-API)
 */
export const updateStateCommandId = 'vscodeArduinoAPI.updateState';

interface UpdateStateParams {
  readonly key: keyof ArduinoState;
  readonly value: ArduinoState[keyof ArduinoState];
}

async function updateState(
  workspaceState: vscode.Memento,
  key: keyof ArduinoState,
  value: ArduinoState[keyof ArduinoState]
): Promise<void> {
  return workspaceState.update(key, value);
}

const noopArduinoState: ArduinoState = {
  sketchPath: undefined,
  buildPath: undefined,
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
      'value' in <UpdateStateParams>arg
    );
  }
  return false;
}
