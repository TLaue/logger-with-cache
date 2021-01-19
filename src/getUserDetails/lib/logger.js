const log = require("@dazn/lambda-powertools-logger");

const LogLevels = {
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50,
};

class Logger {
  #logMessages = [];
  #level = "DEBUG";

  constructor() {
    this.#level = log.level;
  }

  handleMessage(levelName = "debug", message = "", params = {}, error = {}) {
    log[levelName](message, params, error);

    const level = LogLevels[levelName.toUpperCase()];

    if (level < LogLevels[this.#level]) {
      this.addToCache(levelName, message, params, error);
      return;
    }
  }

  addToCache(levelName, ...params) {
    this.#logMessages.push({ levelName, params });
  }

  writeAllMessages() {
    try {
      // The log level of the log has to be set do "debug" as the current log
      // level might prevent messages from being logged.
      log.enableDebug();

      this.#logMessages.forEach((item) => {
        log[item.levelName.toLowerCase()](...item.params);
      });
    } finally {
      log.resetLevel();
    }
  }

  clear() {
    this.#logMessages.length = 0;
  }

  setLevel(newLevel) {
    this.#level = newLevel;
  }

  static setLevel(levelName) {
    const level = LogLevels[levelName.toUpperCase];
    if (level === -1) {
      throw new Error(`Invalid log level: [${levelName}]`);
    }

    globalLogger.setLevel(levelName);
  }

  static get numOfLogMessages() {
    return globalLogger.#logMessages.length;
  }

  static debug(message, params) {
    globalLogger.handleMessage("debug", message, params);
  }

  static info(message, params) {
    globalLogger.handleMessage("info", message, params);
  }

  static warn(message, params, error) {
    globalLogger.handleMessage("warn", message, params, error);
  }

  static error(message, params, error) {
    globalLogger.handleMessage("error", message, params, error);
  }

  static writeAllMessages() {
    globalLogger.writeAllMessages();
  }

  static clear() {
    globalLogger.clear();
  }
}

const globalLogger = new Logger();

module.exports = Logger;
