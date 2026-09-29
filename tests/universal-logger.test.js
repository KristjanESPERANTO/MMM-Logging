const assert = require('node:assert/strict')
const { describe, it } = require('node:test')
const UniversalLogger = require('../universal-logger.js')

const levels = ['log', 'info', 'warn', 'error', 'debug']

function createConsole() {
  const output = []
  const target = {}

  levels.forEach((level) => {
    target[level] = (...args) => output.push({ args, level })
  })

  return { output, target }
}

function createLogger(config = {}) {
  return new UniversalLogger({ useColor: false, ...config })
}

describe('UniversalLogger', () => {
  it('preserves Error messages and stacks', () => {
    const { output, target } = createConsole()
    const logger = createLogger()

    logger.installConsoleMethods(target)
    target.error(new Error('boom'))

    assert.match(output[0].args[0], /<ERROR> Error: boom/)
    assert.match(output[0].args[0], /universal-logger\.test\.js/)
  })

  it('preserves logger placeholders and replacement characters in messages', () => {
    const { output, target } = createConsole()
    const logger = createLogger()

    logger.installConsoleMethods(target)
    target.log('literal {{method}} with $& and $$')

    assert.match(output[0].args[0], /literal \{\{method\}\} with \$& and \$\$/)
  })

  it('supports multiple arguments for direct logger calls', () => {
    const { output, target } = createConsole()
    const logger = createLogger()

    logger.installConsoleMethods(target)
    logger.info('value', { enabled: true }, 42)

    assert.match(output[0].args[0], /<INFO> value \{"enabled":true\} 42/)
  })

  it('routes every console level to the matching logger level', () => {
    const { output, target } = createConsole()
    const logger = createLogger()

    logger.installConsoleMethods(target)
    levels.forEach(level => target[level]('message'))

    assert.deepEqual(output.map(({ level }) => level), levels)
  })

  it('falls back safely for null, undefined, and circular objects', () => {
    const { output, target } = createConsole()
    const circular = {}
    circular.self = circular
    const logger = createLogger()

    logger.installConsoleMethods(target)
    target.log(null, undefined, circular)

    assert.match(output[0].args[0], /<LOG> null undefined \[object Object\]/)
  })

  it('applies ANSI colors when color output is enabled in Node', () => {
    const { output, target } = createConsole()
    const logger = new UniversalLogger({ useColor: true })
    const escape = String.fromCharCode(27)

    logger.installConsoleMethods(target)
    target.warn('warning')

    assert.ok(output[0].args[0].startsWith(`${escape}[33m`))
    assert.ok(output[0].args[0].endsWith(`${escape}[0m`))
  })

  it('updates an existing console wrapper instead of nesting it', () => {
    const { output, target } = createConsole()
    const firstLogger = createLogger({ format: 'first {{message}}' })
    const secondLogger = createLogger({ format: 'second {{message}}' })

    firstLogger.installConsoleMethods(target)
    secondLogger.installConsoleMethods(target)
    target.log('message')

    assert.equal(output.length, 1)
    assert.equal(output[0].args[0], 'second message')
  })
})
