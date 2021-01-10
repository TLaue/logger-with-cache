"use strict";

const log = require("@dazn/lambda-powertools-logger");

const LogLevels = {
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50
};

class Logger {
  constructor() {
    this.level = log.level;
    this.logMessages = [];
  }

  addToCache(levelName, ...params) {
    const level = LogLevels[levelName];
    if (level < LogLevels[this.level]) {
      this.logMessages.push({ levelName, params });
    }
  }

  setLevel(newLevel) {
    this.level = newLevel;
  }

  flush() {
    try {
      // The log level of the log has to be set do "debug" as the current log
      // level might prevent messages from being logged.
      log.enableDebug();

      this.logMessages.forEach((item) => log[item.levelName.toLowerCase()](...item.params));
      this.clear();
    } finally {
      log.resetLevel();
    }
  }

  clear() {
    this.logMessages.length = 0;
  }

  static setLevel(newLevel) {
    globalLogger.setLevel(newLevel);
  }

  static get numOfLogMessages() {
    return globalLogger.logMessages.length;
  }

  static debug(message, params) {
    log.debug(message, params);
    globalLogger.addToCache("DEBUG", message, params);
  }

  static info(message, params) {
    log.info(message, params);
    globalLogger.addToCache("INFO", message, params);
  }

  static warn(message, params, error) {
    log.warn(message, params, error);
    globalLogger.addToCache("WARN", message, params, error);
  }

  static error(message, params, error) {
    log.error(message, params, error);
    globalLogger.addToCache("ERROR", message, params, error);
  }

  static flushAllMessages() {
    globalLogger.flush();
  }

  static clear() {
    globalLogger.clear();
  }
}

const globalLogger = new Logger();

module.exports = Logger;
