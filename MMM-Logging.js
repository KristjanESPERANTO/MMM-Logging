/* global Log, Module, UniversalLogger */

/* MagicMirror²
 * Module: MMM-Logging
 *
 * By shbatm
 * MIT Licensed.
 */

Module.register('MMM-Logging', {
  defaults: {
    useColor: true,
    format: '{{timestamp}} <{{title}}> {{message}} ({{folder}}/{{file}}:{{line}} {{method}})',
    overwriteConsoleMethods: true,
    overwriteBrowserMethods: false,
    echoModuleNotifications: 'notification',
    echoErrors: true,
    dateformat: 'yyyy-mm-dd\'T\'HH:MM:ss',
    ignoreModules: ['calendar', 'newsfeed', 'clock'],
    maxEntries: 100,
  },

  start() {
    this.logEntries = []
    this.displayLogs = Boolean(this.data.position)
    this.sendSocketNotification('INITIALIZE_LOGGING', { ...this.config, displayLogs: this.displayLogs })
    this.console = new UniversalLogger(this.config)
    if (this.config.overwriteBrowserMethods) {
      this.console.installConsoleMethods(window.console)
      // Overwrite MagicMirror's Log functions.
      Log.log = console.log
      Log.info = console.info
      Log.warn = console.warn
      Log.error = console.error
      Log.debug = console.debug || console.log
    }
    Log.info('MMM-Logging updated window.console.')

    if (this.config.echoErrors) {
      Log.error = (...messages) => {
        this.sendSocketNotification('BROWSER_ERROR', messages.map(UniversalLogger.stringifyMessage).join(' '))
        this.console.error(...messages)
      }
      window.addEventListener('error', (event) => {
        this.sendSocketNotification('BROWSER_ERROR', event)
      })
    }
    this.initialized = true
  },

  getScripts() {
    return ['universal-logger.js']
  },

  getStyles() {
    return ['MMM-Logging.css']
  },

  getDom() {
    const wrapper = document.createElement('div')
    wrapper.className = 'mmm-logging'
    this.logContainer = document.createElement('div')
    this.logContainer.className = 'mmm-logging__entries'
    wrapper.appendChild(this.logContainer)
    this.renderLogs()
    return wrapper
  },

  renderLogs() {
    if (!this.logContainer) {
      return
    }

    this.logContainer.replaceChildren()
    this.logEntries.forEach(({ level, message }) => {
      const entry = document.createElement('div')
      entry.className = `mmm-logging__entry mmm-logging__entry--${level}`
      entry.textContent = message
      this.logContainer.appendChild(entry)
    })
    this.logContainer.scrollTop = this.logContainer.scrollHeight
  },

  socketNotificationReceived(notification, payload) {
    if (notification !== 'LOG_ENTRY' || !payload || !this.displayLogs) {
      return
    }

    this.logEntries.push(payload)
    if (this.logEntries.length > this.config.maxEntries) {
      this.logEntries.shift()
    }
    this.renderLogs()
  },

  notificationReceived(notification, payload, sender) {
    if (this.config.echoModuleNotifications) {
      if (sender && this.config.ignoreModules?.includes(sender.name)) {
        return
      }
      this.sendSocketNotification('NOTIFICATION_TO_CONSOLE', {
        notification,
        payload: payload && this.config.echoModuleNotifications === 'payload' ? payload : null,
        sender: sender ? sender.name : null,
      })
    }
  },

})
