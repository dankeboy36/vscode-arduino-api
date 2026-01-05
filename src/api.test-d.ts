import type {
  ConfigOption as CliConfigOption,
  ConfigValue as CliConfigValue,
  Port as CliPort,
  Programmer as CliProgrammer,
} from 'ardunno-cli'
import type {
  BoardIdentifier as BoardsListBoardIdentifier,
  Port as BoardsListPort,
  PortIdentifier,
} from 'boards-list'
import { expectAssignable, expectError, expectType } from 'tsd'
import type {
  BoardIdentifier as ApiBoardIdentifier,
  Port as ApiPort,
  ArduinoContext,
  ArduinoState,
  BoardDetails,
  BuildProperties,
  ChangeEvent,
  CompileSummary,
  ConfigOption,
  ConfigValue,
  Programmer,
  SketchFolder,
  Tool,
  Version,
} from 'vscode-arduino-api'

declare const boardsPort: BoardsListPort
declare const cliPort: CliPort

expectAssignable<ApiPort>(boardsPort)
expectAssignable<ApiPort>(cliPort)

expectAssignable<ApiPort>({
  address: '',
  label: '',
  protocol: '',
  protocolLabel: '',
})

expectAssignable<ApiPort>({
  address: '',
  label: '',
  protocol: '',
  protocolLabel: '',
  properties: { foo: 'bar' },
})

expectError<ApiPort>({
  label: '',
  protocol: '',
  protocolLabel: '',
})

expectError<ApiPort>({
  address: '',
  label: '',
  protocol: '',
  protocolLabel: '',
  properties: { foo: 123 },
})

declare const sketch: SketchFolder

expectType<Readonly<ApiPort> | PortIdentifier | undefined>(sketch.port)
expectType<BoardDetails | BoardsListBoardIdentifier | undefined>(sketch.board)
expectType<Readonly<Programmer> | string | undefined>(sketch.selectedProgrammer)

declare const context: ArduinoContext

expectAssignable<ArduinoState>(context)
expectType<readonly SketchFolder[]>(context.openedSketches)

declare const changeEvent: ChangeEvent<SketchFolder>

expectType<ReadonlyArray<keyof SketchFolder>>(changeEvent.changedProperties)

declare const boardId: BoardsListBoardIdentifier

expectAssignable<ApiBoardIdentifier>(boardId)

declare const cliConfigOption: CliConfigOption
declare const cliConfigValue: CliConfigValue
declare const cliProgrammer: CliProgrammer

expectAssignable<ConfigOption>(cliConfigOption)
expectAssignable<ConfigValue>(cliConfigValue)
expectAssignable<Programmer>(cliProgrammer)

declare const buildProperties: BuildProperties

expectType<string>(buildProperties['build.arch'])
expectError((buildProperties['build.arch'] = 'avr'))

declare const summary: CompileSummary

expectType<BuildProperties>(summary.buildProperties)

declare const details: BoardDetails

expectAssignable<ReadonlyArray<Tool>>(details.toolsDependencies)
expectType<BuildProperties>(details.buildProperties)

declare const version: Version

expectType<string>(version)
