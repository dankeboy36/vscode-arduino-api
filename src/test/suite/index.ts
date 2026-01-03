import path from 'node:path'

import { glob } from 'glob'
import Mocha from 'mocha'

// The nyc setup is based on https://github.com/frenya/vscode-recall/blob/4df52b210b7718d84dca8df392f45424deafc27f/src/test/suite/index.ts
// https://frenya.net/blog/vscode-extension-code-coverage-nyc
import 'source-map-support/register'
import 'ts-node/register'

const tty = require('node:tty')

const NYC = require('nyc')
const baseConfig = require('@istanbuljs/nyc-config-typescript')

if (!tty.getWindowSize) {
  tty.getWindowSize = (): number[] => {
    return [80, 75]
  }
}

export async function run(): Promise<void> {
  // nyc setup

  let nyc: any | undefined
  if (runTestCoverage()) {
    nyc = new NYC({
      ...baseConfig,
      cwd: path.join(__dirname, '..', '..', '..'),
      reporter: ['text'],
      all: true,
      silent: false,
      instrument: true,
      hookRequire: true,
      hookRunInContext: true,
      hookRunInThisContext: true,
      include: ['out/**/*.js'],
      exclude: ['out/test/**'],
    })

    await nyc.reset()
    await nyc.wrap()
    Object.keys(require.cache)
      .filter((f) => nyc.exclude.shouldInstrument(f))
      .forEach((m) => {
        console.warn('Module loaded before NYC, invalidating:', m)
        delete require.cache[m]
        require(m)
      })
  }

  // test
  const testsRoot = path.resolve(__dirname, '..')
  const files = await glob('**/**.test.js', { cwd: testsRoot })
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: noTestTimeout() ? 0 : 10_000,
  })
  files.forEach((file) => mocha.addFile(path.resolve(testsRoot, file)))
  const failures = await new Promise<number>((resolve) => mocha.run(resolve))

  if (nyc) {
    // write coverage
    await nyc.writeCoverageFile()
    console.log(await captureStdout(nyc.report.bind(nyc)))
  }

  if (failures > 0) {
    throw new Error(`${failures} tests failed.`)
  }
}

function noTestTimeout(): boolean {
  return (
    typeof process.env.NO_TEST_TIMEOUT === 'string' &&
    /true/i.test(process.env.NO_TEST_TIMEOUT)
  )
}

function runTestCoverage(): boolean {
  return !(
    typeof process.env.NO_TEST_COVERAGE === 'string' &&
    /true/i.test(process.env.NO_TEST_COVERAGE)
  )
}

async function captureStdout(task: () => Promise<unknown>): Promise<string> {
  const originalWrite = process.stdout.write
  let buffer = ''
  process.stdout.write = (s) => {
    buffer = buffer + s
    return true
  }
  try {
    await task()
  } finally {
    process.stdout.write = originalWrite
  }
  return buffer
}
