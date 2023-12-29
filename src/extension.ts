import vscode from 'vscode';
import { activateArduinoContext } from './arduinoContext';
import { InmemoryState } from './inmemoryState';

export function activate(context: vscode.ExtensionContext) {
  const arduinoContext = activateArduinoContext(
    context,
    new InmemoryState(), // TODO: persist to the `workspaceState`?
    () => vscode.window.createOutputChannel('Arduino API')
  );
  context.subscriptions.push(
    arduinoContext,
    vscode.commands.registerCommand(
      'arduinoAPI.updateState',
      arduinoContext.update
    )
  );
  return arduinoContext;
}
