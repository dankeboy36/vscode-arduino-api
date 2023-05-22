import type {
  BoardDetailsResponse,
  CompileResponse,
  ConfigOption,
  ConfigValue,
  Port,
  Programmer,
  ToolsDependencies,
} from 'ardunno-cli';
import type { Event } from 'vscode';
export type { Disposable, Event } from 'vscode';
export type { ConfigOption, ConfigValue, Port, Programmer };

/**
 * The current state of the Arduino IDE.
 */
export interface ArduinoState {
  /**
   * Absolute filesystem path of the sketch folder.
   */
  readonly sketchPath: string | undefined;

  /**
   * The summary of the latest sketch compilation. When the `sketchPath` is available but the sketch has not been verified (compiled), the `buildPath` can be `undefined`.
   * @alpha
   */
  readonly compileSummary: CompileSummary | undefined;

  /**
   * The Fully Qualified Board Name (FQBN) of the currently selected board in the Arduino IDE.
   */
  readonly fqbn: string | undefined;

  /**
   * Lightweight representation of the board's detail. This information is [provided by the Arduino CLI](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the currently selected board. It can be `undefined` if the `fqbn` is defined but the platform is not installed.
   * @alpha
   */
  readonly boardDetails: BoardDetails | undefined;

  /**
   * The currently selected port in the Arduino IDE.
   */
  readonly port: Port | undefined;

  /**
   * Filesystem path to the [`directories.user`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location. This is the sketchbook path.
   * @alpha
   */
  readonly userDirPath: string | undefined;

  /**
   * Filesystem path to the [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location.
   * @alpha
   */
  readonly dataDirPath: string | undefined;
}

/**
 * Provides access to the current state of the Arduino IDE such as the sketch path, the currently selected board, and port, and etc.
 */
export interface ArduinoContext extends ArduinoState {
  onDidChange<T extends keyof ArduinoState>(
    property: T
  ): Event<ArduinoState[T]>;
}

/**
 * Supposed to be a [SemVer](https://semver.org/) as a `string` but it's not enforced by Arduino. You might need to coerce the SemVer string.
 */
export type Version = string;

/**
 * Build properties used for compiling. The board-specific properties are retrieved from `board.txt` and `platform.txt`. For example, if the `board.txt` contains the `build.tarch=xtensa` entry for the `esp32:esp32:esp32` board, the record includes the `"build.tarch": "xtensa"` property.
 */
export type BuildProperties = Readonly<Record<string, string>>;

/**
 * The lightweight representation of all details of a particular board. See [`BoardDetailsResponse`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the CLI API.
 * @alpha
 */
export interface BoardDetails
  extends Readonly<
    Pick<BoardDetailsResponse, 'fqbn' | 'configOptions' | 'programmers'>
  > {
  readonly toolsDependencies: Tool[];
  readonly buildProperties: BuildProperties;
}

/**
 * Required Tool dependencies of a board. See [`ToolsDependencies`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.ToolsDependencies) for the CLI API.
 * @alpha
 */
export type Tool = Readonly<
  Pick<ToolsDependencies, 'name' | 'version' | 'packager'>
>;

/**
 * Summary of a sketch compilation. See [`CompileResponse`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#compileresponse) for the CLI API.
 * @alpha
 */
export interface CompileSummary
  extends Readonly<
    Pick<
      CompileResponse,
      | 'buildPath'
      | 'usedLibraries'
      | 'executableSectionsSize'
      | 'boardPlatform'
      | 'buildPlatform'
    >
  > {
  readonly buildProperties: BuildProperties;
}
