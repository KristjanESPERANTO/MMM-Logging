# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.0.5](https://github.com/shbatm/MMM-Logging/compare/v1.0.4...v1.0.5) (2026-09-29)

### Fixed

* **logging:** stabilize console interception ([0fba033](https://github.com/shbatm/MMM-Logging/commit/0fba0335d46d5eca057663bc4f600e43124e6403))

### Documentation

* fix typographical error in README.md ([#11](https://github.com/shbatm/MMM-Logging/issues/11)) ([c0b5c6a](https://github.com/shbatm/MMM-Logging/commit/c0b5c6ae891e36447fdabe33a15bdbf7e122fe28))

### Chores

* add demo script ([a6a16c7](https://github.com/shbatm/MMM-Logging/commit/a6a16c7f87cff580bf33bffc7fa30fbf2ea28781))
* add dependabot config ([e165098](https://github.com/shbatm/MMM-Logging/commit/e16509863e4720ff20fd13200942c896c2f6737c))
* add release tooling ([f66f645](https://github.com/shbatm/MMM-Logging/commit/f66f6455b4529cdd3cb64b74e9f339f230c24aa3))
* update devDependencies ([5d8c325](https://github.com/shbatm/MMM-Logging/commit/5d8c325f8441dd0d670e1949ec02e14d24b4bdf0))

### Tests

* add unit tests ([148b4fa](https://github.com/shbatm/MMM-Logging/commit/148b4faec7e6f56503f825f306f53b2f26208d95))

## [1.0.4](https://github.com/shbatm/MMM-Logging/compare/v1.0.3...v1.0.4)

### Changed

- chore: add linter and formatter - and fix found issues
- chore: switch License file to markdown
- chore: update Code of Conduct to current version
- docs: add Code of Conduct and License sections to README
- docs: rework Configuration section
- refactor: replace dependency `tracer` with own logger

## [1.0.3](https://github.com/shbatm/MMM-Logging/compare/v1.0.2...v1.0.3)

### Changed

- chore: remove unused dependency 'tinyify' from package.json (#7)
- chore: Non-Substantive changes to conform to recommendations (#5)
- feat: Default to Ignore Clock Notifications as well
- refactor: introduce extra variables to make the notification logging logic clearer (#9)

### Fixed

- Ignore empty payloads

## [1.0.2](https://github.com/shbatm/MMM-Logging/compare/v1.0.1...v1.0.2) - Remove Testing Code & Add Ignore Modules option

### Added

- `ignoreModules` option to ignore notifications sent from certain modules. Defaults to ignoring `calendar` and `newsfeed` since these send a lot of nuisance notifications.

### Changed

- Removed errant code from testing phase.

## [1.0.1](https://github.com/shbatm/MMM-Logging/compare/v1.0.0...v1.0.1) - Add browser methods

### Added

- `overwriteBrowserMethods` option to format the Web Browser's (DevTools) logs as well as the Node.JS console logs. Defaults to `false` so to enable it, you must add it in your config section.
- `echoModuleNotifications` option to relay module notifications to the NodeJS console as well as DevTools.
- `echoErrors` option to relay browser errors to the NodeJS console as well as DevTools.

## [1.0.0](https://github.com/shbatm/MMM-Logging/releases/tag/v1.0.0) - Initial Release

- Initial commit for public testing.
