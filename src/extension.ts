import * as vscode from 'vscode';
import { createArduinoContext } from './arduinoContext';

export function activate(context: vscode.ExtensionContext) {
  const arduinoContext = createArduinoContext(context.workspaceState);
  context.subscriptions.push(arduinoContext);
  return arduinoContext;
}
