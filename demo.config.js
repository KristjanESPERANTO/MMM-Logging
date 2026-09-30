const config = {
  address: '0.0.0.0',
  ipWhitelist: [],
  logLevel: ['INFO', 'LOG', 'WARN', 'ERROR', 'DEBUG'],
  modules: [
    {
      module: 'MMM-Logging',
      position: 'top_left',
      config: {
        useColor: false,
        overwriteBrowserMethods: true,
        overwriteConsoleMethods: true,
        echoModuleNotifications: 'payload',
        ignoreModules: [],
        // Demo/test only: periodically emits sample console output to observe logging behavior
        demoNoise: true,
      },
    },
    {
      module: 'weather',
      position: 'middle_center',
      header: 'Wetter',
      config: {
        weatherProvider: 'openmeteo',
        type: 'current',
        lat: 52.52,
        lon: 13.405,
        updateInterval: 10 * 60 * 1000,
      },
    },
  ],
}

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== 'undefined') {
  module.exports = config
}
