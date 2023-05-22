import type { Memento } from 'vscode';

export class InmemoryState implements Memento {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly state: Record<string, any>;

  constructor() {
    this.state = {};
  }

  keys(): readonly string[] {
    return Object.keys(this.state);
  }

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: unknown): T | undefined {
    return this.state[key] ?? defaultValue;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(key: string, value: any): Thenable<void> {
    if (value === undefined) {
      delete this.state[key];
    } else {
      this.state[key] = value;
    }
    return Promise.resolve();
  }
}
