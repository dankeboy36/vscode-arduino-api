import type { Disposable, Event } from 'vscode';
export type { Disposable, Event };

/**
 * The current state of the Arduino IDE.
 */
export interface ArduinoState {
  /**
   * Absolute filesystem path of the sketch folder.
   */
  readonly sketchPath: string | undefined;

  /**
   * The absolute filesystem path to the build folder of the sketch. When the `sketchPath` is available but the sketch has not been verified (compiled), the `buildPath` can be `undefined`.
   * @alpha
   */
  readonly buildPath: string | undefined;

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
   */
  readonly userDirPath: string | undefined;

  /**
   * Filesystem path to the [`directories.data`](https://arduino.github.io/arduino-cli/latest/configuration/#configuration-keys) location.
   */
  readonly dataDirPath: string | undefined;
}

/**
 * Provides access to the current state of the Arduino IDE such as the sketch path, the currently selected board, and port, and etc.
 */
export interface ArduinoContext extends ArduinoState {
  readonly onDidChange: Readonly<
    Record<keyof ArduinoState, Event<ArduinoState[keyof ArduinoState]>>
  >;
}

// TODO: all types must come from `ardunno-cli`. See https://github.com/dankeboy36/ardunno-cli.
/**
 * Supposed to be a [SemVer](https://semver.org/) as a `string` but it's not enforced by Arduino. You might need to coerce the SemVer string.
 */
export type Version = string;

/**
 * Port represents a board port that may be used to upload or to monitor a board. See [`Port`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.Port) for the CLI API.
 */
export interface Port {
  readonly address: string;
  readonly protocol: string;
  readonly properties?: Record<string, string>;
  readonly hardwareId?: string;
}

/**
 * The lightweight representation of all details of a particular board. See [`BoardDetailsResponse`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.BoardDetailsResponse) for the CLI API.
 * @alpha
 */
export interface BoardDetails {
  readonly fqbn: string;
  readonly requiredTools: Tool[];
  readonly configOptions: ConfigOption[];
  readonly programmers: Programmer[];
  readonly VID: string;
  readonly PID: string;
}

/**
 * Required Tool dependencies of a board. See [`ToolsDependencies`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.ToolsDependencies) for the CLI API.
 * @alpha
 */
export interface Tool {
  readonly packager: string;
  readonly name: string;
  readonly version: Version;
}

/**
 * The board's custom configuration options. See [`ConfigOption`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.ConfigOption) for the CLI API.
 * @alpha
 */
export interface ConfigOption {
  readonly option: string;
  readonly label: string;
  readonly values: ConfigValue[];
}

/**
 * Programmer supported by the board. See [`Programmer`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.Programmer) for the CLI API.
 * @alpha
 */
export interface Programmer {
  readonly name: string;
  readonly platform: string;
  readonly id: string;
}

/**
 * Value of the configuration option. See [`ConfigValue`](https://arduino.github.io/arduino-cli/latest/rpc/commands/#cc.arduino.cli.commands.v1.ConfigValue) for the CLI API.
 * @alpha
 */
export interface ConfigValue {
  readonly label: string;
  readonly value: string;
  readonly selected: boolean;
}
