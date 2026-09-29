/* Universal Logger Implementation
 * Works in both Node.js and Browser environments
 * Replacement for tracer library
 * MIT Licensed.
 */

// Environment detection
const isNode = typeof window === 'undefined' && typeof module !== 'undefined' && module.exports
const isBrowser = typeof window !== 'undefined'
const consoleInstallationKey = Symbol.for('MMMLogging.consoleInstallation')

// Universal Logger Class
class UniversalLogger {
  constructor(config = {}) {
    this.config = {
      format: '{{timestamp}} <{{title}}> {{message}} ({{folder}}/{{file}}:{{line}} {{method}})',
      dateformat: 'yyyy-mm-dd\'T\'HH:MM:ss',
      useColor: false,
      overwriteConsoleMethods: true,
      ...config,
    }
    this.consoleMethods = null

    // Colors for different environments
    if (isNode) {
      // ANSI color codes for Node.js
      this.colors = {
        log: '\x1b[37m', // white
        info: '\x1b[36m', // cyan
        warn: '\x1b[33m', // yellow
        error: '\x1b[31m', // red
        debug: '\x1b[35m', // magenta
        reset: '\x1b[0m',
      }
    }
    else {
      // CSS styles for browser
      this.colors = {
        log: 'color: #000000', // black
        info: 'color: #0000FF', // blue
        warn: 'color: #FFA500', // orange
        error: 'color: #FF0000', // red
        debug: 'color: #800080', // purple
      }
    }
  }

  static formatTimestamp() {
    const now = new Date()
    return now.toISOString()
      .replace('T', 'T')
      .substring(0, 19)
  }

  static getStackInfo() {
    const { stack } = new Error()
    if (stack) {
      const line = stack.split('\n').slice(1).find(stackLine => !stackLine.includes('universal-logger.js'))
      const match = line?.match(/at\s+(?<method>.+?)\s+\((?<filepath>.+):(?<line>\d+):(?<column>\d+)\)/u)
        || line?.match(/at\s+(?<filepath>.+):(?<line>\d+):(?<column>\d+)/u)
      if (match && match.groups) {
        const { method = 'anonymous', filepath, line: lineNum } = match.groups
        const parts = filepath.split('/')
        const file = parts.pop() || 'unknown'
        const folder = parts.pop() || 'unknown'
        return { method, file, folder, line: lineNum }
      }
    }
    return { method: 'unknown', file: 'unknown', folder: 'unknown', line: '0' }
  }

  static stringifyMessage(message) {
    if (typeof message === 'string') {
      return message
    }
    if (message === undefined) {
      return 'undefined'
    }
    if (message === null) {
      return 'null'
    }
    if (message instanceof Error) {
      return message.stack || `${message.name}: ${message.message}`
    }
    if (typeof message === 'object') {
      try {
        const serialized = JSON.stringify(message)
        return serialized === undefined ? String(message) : serialized
      }
      catch {
        return String(message)
      }
    }
    return String(message)
  }

  installConsoleMethods(targetConsole = console) {
    const existingInstallation = targetConsole[consoleInstallationKey]
    if (existingInstallation) {
      existingInstallation.logger = this
      this.consoleMethods = existingInstallation.consoleMethods
      return
    }

    const levels = ['log', 'info', 'warn', 'error', 'debug']
    const installation = { logger: this, consoleMethods: {} }
    levels.forEach((level) => {
      const method = typeof targetConsole[level] === 'function' ? targetConsole[level] : targetConsole.log
      installation.consoleMethods[level] = method.bind(targetConsole)
    })

    levels.forEach((level) => {
      targetConsole[level] = (...messages) => installation.logger.logWithColor(level, messages)
    })
    Object.defineProperty(targetConsole, consoleInstallationKey, { value: installation })
    this.consoleMethods = installation.consoleMethods
  }

  formatMessage(level, message) {
    const timestamp = UniversalLogger.formatTimestamp()
    const { method, file, folder, line } = UniversalLogger.getStackInfo()
    const messageText = Array.isArray(message)
      ? message.map(UniversalLogger.stringifyMessage).join(' ')
      : UniversalLogger.stringifyMessage(message)

    const values = { timestamp, title: level.toUpperCase(), message: messageText, method, file, folder, line }
    const formatted = this.config.format.replace(/\{\{(timestamp|title|message|method|file|folder|line)\}\}/gu, (placeholder, key) => values[key])

    return formatted
  }

  logWithColor(level, message) {
    const formatted = this.formatMessage(level, message)
    const output = this.consoleMethods?.[level] || this.consoleMethods?.log || console[level]

    if (this.config.useColor) {
      if (isNode) {
        // Node.js: Use ANSI codes
        const colorCode = this.colors[level] || this.colors.log
        output(colorCode + formatted + this.colors.reset)
      }
      else {
        // Browser: Use CSS styles
        const colorStyle = this.colors[level] || this.colors.log
        output(`%c${formatted}`, colorStyle)
      }
    }
    else {
      output(formatted)
    }
  }

  log(...messages) {
    this.logWithColor('log', messages)
  }

  info(...messages) {
    this.logWithColor('info', messages)
  }

  warn(...messages) {
    this.logWithColor('warn', messages)
  }

  error(...messages) {
    this.logWithColor('error', messages)
  }

  debug(...messages) {
    this.logWithColor('debug', messages)
  }
}

// Export for different environments
if (isNode) {
  // Node.js export - clean ES module style
  module.exports = UniversalLogger
}
else if (isBrowser) {
  // Browser export - single global class
  window.UniversalLogger = UniversalLogger
}
