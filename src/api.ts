import type {
  BoardDetailsResponse,
  BuilderResult,
  ConfigOption as CliConfigOption,
  ConfigValue as CliConfigValue,
  Port as CliPort,
  Programmer as CliProgrammer,
  ToolsDependencies,
} from 'ardunno-cli'
import type { BoardIdentifier, PortIdentifier } from 'boards-list'
import type { Event } from 'vscode'

/**
 * Bare minimum representation of the Arduino CLI
 * [configuration](https://arduino.github.io/arduino-cli/latest/configuration).
 */
export interface CliConfig {
  /**
   * Filesystem path to the
   * [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
   * location. This is the sketchbook path.
   *
   * @alpha
   */
  readonly userDirPath: string | undefined

  /**
   * Filesystem path to the
   * [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
   * location.
   *
   * @alpha
   */
  readonly dataDirPath: string | undefined
}

/**
 * The current state in the sketch folder. For example, the FQBN of the selected
 * board, the selected port, etc.
 */
export interface SketchFolder {
  /** Absolute filesystem path of the sketch folder. */
  readonly sketchPath: string

  /**
   * The summary of the latest sketch compilation. When the `sketchPath` is
   * available but the sketch has not been verified (compiled), the compile
   * summary can be `undefined`.
   *
   * @alpha
   */
  readonly compileSummary: CompileSummary | undefined

  /**
   * The currently selected board associated with the sketch. If the `board` is
   * undefined, no board is selected. If the `board` is a `BoardIdentifier`, it
   * could be a recognized board on a detected port, but the board's platform
   * could be absent. If platform is installed, the `board` is the lightweight
   * representation of the board's detail. This information is [provided by the
   * Arduino
   * CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse)
   * for the currently selected board in the sketch folder.
   *
   * @alpha
   */
  readonly board: BoardDetails | BoardIdentifier | undefined

  /**
   * The currently selected port in the sketch folder.
   *
   * @alpha
   */
  readonly port: Readonly<Port> | PortIdentifier | undefined

  /**
   * The currently selected programmer.
   *
   * @alpha
   */
  readonly selectedProgrammer: Readonly<Programmer> | string | undefined

  /**
   * The FQBN with all the custom board options (if any) for the sketch.
   * `a:b:c:opt1=value_1,opt2=value_2` means `{ "opt1": "value_1", "opt2":
   * "value_2" }` config options are configured.
   *
   * @alpha
   */
  readonly configOptions: string | undefined
}

/**
 * An event describing a change to the set of
 * {@link SketchFolder sketch folders}.
 */
export interface SketchFoldersChangeEvent {
  /** Added sketch folders. */
  readonly addedPaths: readonly string[]
  /** Removed sketch folders. */
  readonly removedPaths: readonly string[]
}

/** The current state of the Arduino IDE. */
export interface ArduinoState {
  /**
   * Absolute filesystem path of the sketch folder.
   *
   * @deprecated Use `arduinoContext?.currentSketch?.sketchPath` instead.
   */
  readonly sketchPath: string | undefined

  /**
   * The summary of the latest sketch compilation. When the `sketchPath` is
   * available but the sketch has not been verified (compiled), the `buildPath`
   * can be `undefined`.
   *
   * @deprecated Use `arduinoContext?.currentSketch?.compileSummary` instead.
   */
  readonly compileSummary: CompileSummary | undefined

  /**
   * The Fully Qualified Board Name (FQBN) of the currently selected board in
   * the Arduino IDE.
   *
   * @deprecated Use `arduinoContext?.currentSketch?.board?.fqbn` instead.
   */
  readonly fqbn: string | undefined

  /**
   * Lightweight representation of the board's detail. This information is
   * [provided by the Arduino
   * CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse)
   * for the currently selected board. It can be `undefined` if the `fqbn` is
   * defined but the platform is not installed.
   *
   * @deprecated Use `arduinoContext?.currentSketch?.boardDetails` instead.
   */
  readonly boardDetails: BoardDetails | undefined

  /**
   * The currently selected port in the Arduino IDE.
   *
   * @deprecated Use `arduinoContext?.currentSketch?.port` instead.
   */
  readonly port: Port | undefined

  /**
   * Filesystem path to the
   * [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
   * location. This is the sketchbook path.
   *
   * @deprecated Use `arduinoContext?.config?.userDirPath` instead.
   */
  readonly userDirPath: string | undefined

  /**
   * Filesystem path to the
   * [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys)
   * location.
   *
   * @deprecated Use `arduinoContext?.config?.dataDirPath` instead.
   */
  readonly dataDirPath: string | undefined
}

/**
 * Provides access to the current state of the Arduino IDE such as the sketch
 * path, the currently selected board, and port, and etc.
 */
export interface ArduinoContext extends ArduinoState {
  /** All opened sketch folders in the window. */
  readonly openedSketches: readonly SketchFolder[]

  /**
   * The currently active sketch (folder) or `undefined`. The current sketch is
   * the one that currently has focus or most recently had focus. The current
   * sketch is in the {@link openedSketches opened sketches}.
   */
  readonly currentSketch: SketchFolder | undefined

  /**
   * An {@link Event} that is emitted when the
   * {@link currentSketch current sketch} has changed. _Note_ that the event also
   * fires when the active editor changes to `undefined`.
   */
  readonly onDidChangeCurrentSketch: Event<SketchFolder | undefined>

  /** An event that is emitted when sketch folders are added or removed. */
  readonly onDidChangeSketchFolders: Event<SketchFoldersChangeEvent>

  /**
   * An event that is emitted when the selected {@link SketchFolder.board board},
   * {@link SketchFolder.port port}, etc., has changed in the
   * {@link SketchFolder sketch folder}.
   */
  readonly onDidChangeSketch: Event<ChangeEvent<SketchFolder>>

  /** The currently configured Arduino CLI configuration. */
  readonly config: CliConfig

  /**
   * An event that is emitter when the {@link CliConfig.userDirPath sketchbook}
   * (`directories.data`) or the {@link CliConfig.dataDirPath data directory}
   * (`directories.data`) path has changed.
   */
  readonly onDidChangeConfig: Event<ChangeEvent<CliConfig>>

  /** @deprecated Use `onDidChangeSketch` and `onDidChangeConfig` instead. */
  onDidChange<T extends keyof ArduinoState>(property: T): Event<ArduinoState[T]>
}

/**
 * Describes a change event with the new state of the `object` and an array
 * indicating which property has changed.
 */
export interface ChangeEvent<T> {
  /** The new state of the object */
  readonly object: T
  /** An array properties that have changed in the `object`. */
  readonly changedProperties: readonly (keyof T)[]
}

/**
 * Supposed to be a [SemVer](https://semver.org/) as a `string` but it's not
 * enforced by Arduino. You might need to coerce the SemVer string.
 */
export type Version = string

/**
 * Build properties used for compiling. The board-specific properties are
 * retrieved from `board.txt` and `platform.txt`. For example, if the
 * `board.txt` contains the `build.tarch=xtensa` entry for the
 * `esp32:esp32:esp32` board, the record includes the `"build.tarch": "xtensa"`
 * property.
 */
export type BuildProperties = Readonly<Record<string, string>>

/**
 * The lightweight representation of all details of a particular board. See
 * [`BoardDetailsResponse`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse)
 * for the CLI API.
 *
 * @alpha
 */
export interface BoardDetails extends Readonly<
  Pick<
    BoardDetailsResponse,
    'fqbn' | 'name' | 'configOptions' | 'programmers' | 'defaultProgrammerId'
  >
> {
  readonly toolsDependencies: Tool[]
  readonly buildProperties: BuildProperties
}

/**
 * Required Tool dependencies of a board. See
 * [`ToolsDependencies`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.ToolsDependencies)
 * for the CLI API.
 *
 * @alpha
 */
export type Tool = Readonly<
  Pick<ToolsDependencies, 'name' | 'version' | 'packager'>
>

/**
 * Summary of a sketch compilation. See
 * [`BuilderResult`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BuilderResult)
 * of the CLI API.
 *
 * @alpha
 */
export interface CompileSummary extends Readonly<
  Pick<
    BuilderResult,
    | 'buildPath'
    | 'usedLibraries'
    | 'executableSectionsSize'
    | 'boardPlatform'
    | 'buildPlatform'
  >
> {
  readonly buildProperties: BuildProperties
}

/**
 * Represents a type which can release resources, such as event listening or a
 * timer.
 */
export interface Disposable {
  dispose(): void
}

export type { BoardIdentifier } from 'boards-list'
export type { Event } from 'vscode'
export interface ConfigOption extends CliConfigOption {}
export interface ConfigValue extends CliConfigValue {}
export interface Port extends CliPort {}
export interface Programmer extends CliProgrammer {}
