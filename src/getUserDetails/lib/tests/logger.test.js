"use strict";

const { expect } = require("chai");
const sinon = require("sinon");
const sandbox = sinon.createSandbox();

const BasicLogger = require("@dazn/lambda-powertools-logger");
const underTest = require("../logger");

describe("logger", () => {
  const testMessage = "Test message";

  describe("Verify basic functionality", () => {
    before(() => resetToDebugLevel());
    afterEach(() => sandbox.restore());

    it("Should trigger debug method", () => {
      performTest("debug");
    });

    it("Should trigger info method", () => {
      performTest("info");
    });

    it("Should trigger warn method", () => {
      performTest("warn", {}, new Error());
    });

    it("Should trigger error method", () => {
      performTest("error", {}, new Error());
    });

    it("Should log object with bigInt property", () => {
      performTest("debug", { data: BigInt(1) });
    });

    const performTest = (level = "debug", params = {}, error) => {
      const stub = sandbox.stub(BasicLogger.prototype, level);

      if (error) {
        underTest[level](testMessage, params, error);
        sinon.assert.calledWith(stub, testMessage, params, error);
      } else {
        underTest[level](testMessage, params);
        sinon.assert.calledWith(stub, testMessage, params);
      }

      sinon.assert.called(stub);
      expect(underTest.numOfLogMessages).to.be.equal(0);

      stub.restore();
    };
  });

  describe("Verify caching behaviour", () => {
    beforeEach(() => {
      underTest.setLevel("WARN");
      sandbox.stub(BasicLogger.prototype, "debug");
    });

    afterEach(() => {
      sandbox.restore();
      resetToDebugLevel();
      underTest.clear();
    });

    it("Should put into cache if current log level is higher than called level", () => {
      underTest.debug(testMessage);
      expect(underTest.numOfLogMessages).to.equal(1);
    });

    it("Should clear all cached messages", () => {
      underTest.debug(testMessage);
      expect(underTest.numOfLogMessages).to.equal(1);

      underTest.clear();
      expect(underTest.numOfLogMessages).to.equal(0);
    });

    it("Should write all messages", () => {
      sandbox.spy(BasicLogger.prototype, "info");
      sandbox.spy(BasicLogger, "enableDebug");
      sandbox.spy(BasicLogger, "resetLevel");

      underTest.debug(testMessage);
      underTest.info(testMessage);
      underTest.writeAllMessages();

      sinon.assert.calledOnce(BasicLogger.prototype.debug);
      sinon.assert.calledOnce(BasicLogger.prototype.info);
      sinon.assert.calledOnce(BasicLogger.enableDebug);
      sinon.assert.calledOnce(BasicLogger.resetLevel);
    });
  });

  const resetToDebugLevel = () => underTest.setLevel("DEBUG");
});
