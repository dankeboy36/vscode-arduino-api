import vscode from 'vscode';
import { createArduinoContext } from './arduinoContext';
import { InmemoryState } from './inmemoryState';

export function activate(context: vscode.ExtensionContext) {
  const arduinoContext = createArduinoContext(new InmemoryState()); // TODO: persist to the `workspaceState`?
  context.subscriptions.push(arduinoContext);
  return arduinoContext;
}
