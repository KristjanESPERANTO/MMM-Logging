/* MagicMirror²
 * Node Helper: MMM-Logging
 *
 * By shbatm
 * MIT Licensed.
 */

const Log = require('logger')
const NodeHelper = require('node_helper')
const UniversalLogger = require('./universal-logger.js')

let logger = new UniversalLogger({
  format: '{{timestamp}} <{{title}}> {{message}} ({{folder}}/{{file}}:{{line}} {{method}})',
  dateformat: 'yyyy-mm-dd\'T\'HH:MM:ss',
})

// Helper function to extract simple properties from error objects
const extractSimpleProps = (payload) => {
  const simpleProps = {}
  Object.keys(payload).forEach((key) => {
    const value = payload[key]
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      if (key !== 'isTrusted' && key !== 'timeStamp') {
        simpleProps[key] = value
      }
    }
  })
  return simpleProps
}

// Helper function to get useful error object description
const getErrorObjectDescription = (payload) => {
  const objectInfo = []
  if (payload.type) {
    objectInfo.push(`type: ${payload.type}`)
  }
  if (payload.code) {
    objectInfo.push(`code: ${payload.code}`)
  }
  if (payload.name) {
    objectInfo.push(`name: ${payload.name}`)
  }

  if (objectInfo.length > 0) {
    return objectInfo.join(', ')
  }

  // Show available keys for debugging
  const keys = Object.keys(payload).filter(key => key !== 'isTrusted' && key !== 'timeStamp' && key !== 'target'
    && key !== 'currentTarget' && key !== 'srcElement')

  return keys.length > 0
    ? `Unknown error object with keys: [${keys.join(', ')}]`
    : 'Unknown error object'
}

// Helper function to format browser errors
const formatBrowserError = (payload) => {
  let errorMessage = 'Browser Error: '

  if (payload && typeof payload === 'object') {
    // Extract useful information from error events
    if (payload.message) {
      errorMessage += payload.message
      if (payload.filename) {
        errorMessage += ` in ${payload.filename}`
      }
      if (payload.lineno) {
        errorMessage += `:${payload.lineno}`
      }
      if (payload.colno) {
        errorMessage += `:${payload.colno}`
      }
    }
    else if (payload.error && payload.error.message) {
      errorMessage += payload.error.message
      if (payload.error.stack) {
        errorMessage += `\n${payload.error.stack}`
      }
    }
    else {
      // Fallback: extract basic info or show event type
      const simpleProps = extractSimpleProps(payload)

      if (Object.keys(simpleProps).length > 0) {
        errorMessage += JSON.stringify(simpleProps)
      }
      else {
        errorMessage += getErrorObjectDescription(payload)
      }
    }
  }
  else {
    errorMessage += String(payload)
  }

  return errorMessage
}

// Test-only: emits a rotating sample of console calls so log interception/formatting can be observed live
const demoNoiseSamples = [
  () => console.log('demo noise: plain log message'),
  () => console.info('demo noise: info with payload', { sample: true }),
  () => console.warn('demo noise: warning message'),
  () => console.error(new Error('demo noise: sample error')),
  () => console.debug('demo noise: debug value', 42),
]

module.exports = NodeHelper.create({
  start() {
    Log.log(`Module helper started for ${this.name}`)
  },

  stop() {
    clearInterval(this.demoNoiseInterval)
  },

  socketNotificationReceived(notification, payload) {
    if (notification === 'INITIALIZE_LOGGING') {
      this.config = payload
      // Create new logger instance with updated config
      logger = new UniversalLogger({
        ...this.config,
        format: '{{timestamp}} <{{title}}> {{message}} ({{folder}}/{{file}}:{{line}} {{method}})',
        dateformat: 'yyyy-mm-dd\'T\'HH:MM:ss',
      })
      if (this.config.overwriteConsoleMethods) {
        logger.installConsoleMethods()
      }
      logger.onLog = this.config.displayLogs
        ? entry => this.sendSocketNotification('LOG_ENTRY', entry)
        : null
      // Clear any interval from a previous frontend (re)load before starting a new one
      clearInterval(this.demoNoiseInterval)
      if (this.config.demoNoise) {
        let index = 0
        this.demoNoiseInterval = setInterval(() => {
          demoNoiseSamples[index % demoNoiseSamples.length]()
          index += 1
        }, 4000)
      }
      Log.info('MMM-Logging updated config received, reloading console')
    }
    if (notification === 'NOTIFICATION_TO_CONSOLE' && payload) {
      const senderInfo = payload.sender ? ` from ${payload.sender}` : ''
      const payloadInfo = payload.payload ? ` payload: ${JSON.stringify(payload.payload, null, 3)}` : ''
      logger.log(`Module Notification: ${payload.notification}${senderInfo}${payloadInfo}`)
    }
    if (notification === 'BROWSER_ERROR') {
      logger.error(formatBrowserError(payload))
    }
  },
})
