import vscode from 'vscode'

import { activateArduinoContext } from './arduinoContext'

export function activate(context: vscode.ExtensionContext) {
  const arduinoContext = activateArduinoContext(context, () =>
    vscode.window.createOutputChannel('Arduino API')
  )
  context.subscriptions.push(
    arduinoContext,
    vscode.commands.registerCommand(
      'arduinoAPI.updateState',
      arduinoContext.update
    )
  )
  return arduinoContext
}
