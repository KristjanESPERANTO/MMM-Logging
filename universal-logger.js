/* Universal Logger Implementation
 * Works in both Node.js and Browser environments
 * Replacement for tracer library
 * MIT Licensed.
 */

// Environment detection
const isNode = typeof window === 'undefined' && typeof module !== 'undefined' && module.exports
const isBrowser = typeof window !== 'undefined'
const consoleInstallationKey = Symbol.for('MMMLogging.consoleInstallation')

const LEVELS = ['log', 'info', 'warn', 'error', 'debug']
const LEVEL_COLORS = {
  log: { ansi: '\x1b[37m', css: 'color: #000000' }, // white / black
  info: { ansi: '\x1b[36m', css: 'color: #0000FF' }, // cyan / blue
  warn: { ansi: '\x1b[33m', css: 'color: #FFA500' }, // yellow / orange
  error: { ansi: '\x1b[31m', css: 'color: #FF0000' }, // red / red
  debug: { ansi: '\x1b[35m', css: 'color: #800080' }, // magenta / purple
}

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
    this.onLog = null

    // Colors for different environments, keyed by level
    this.colors = Object.fromEntries(LEVELS.map(level => [level, LEVEL_COLORS[level][isNode ? 'ansi' : 'css']]))
    if (isNode) {
      this.colors.reset = '\x1b[0m'
    }
  }

  static formatTimestamp() {
    return new Date().toISOString().substring(0, 19)
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

    const installation = { logger: this, consoleMethods: {} }
    LEVELS.forEach((level) => {
      const method = typeof targetConsole[level] === 'function' ? targetConsole[level] : targetConsole.log
      installation.consoleMethods[level] = method.bind(targetConsole)
    })

    LEVELS.forEach((level) => {
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
    this.onLog?.({ level, message: formatted })

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
}

// Direct logger.log/info/warn/error/debug(...) methods
LEVELS.forEach((level) => {
  UniversalLogger.prototype[level] = function (...messages) {
    this.logWithColor(level, messages)
  }
})

// Export for different environments
if (isNode) {
  // Node.js export - clean ES module style
  module.exports = UniversalLogger
}
else if (isBrowser) {
  // Browser export - single global class
  window.UniversalLogger = UniversalLogger
}
