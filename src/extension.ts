import vscode from 'vscode';
import { activateArduinoContext } from './arduinoContext';
import { InmemoryState } from './inmemoryState';

export function activate(context: vscode.ExtensionContext) {
  const arduinoContext = activateArduinoContext(context, new InmemoryState()); // TODO: persist to the `workspaceState`?
  context.subscriptions.push(arduinoContext);
  return arduinoContext;
}
