"use strict";

const { expect } = require("chai");
const sinon = require("sinon");

const BasicLogger = require("../../../src/cloudutils/node_modules/@dazn/lambda-powertools-logger");
const underTest = require("../../../src/cloudutils/misc/logger");

describe("logger", () => {
  const testMessage = "Test message";

  describe("Verify basic functionality", () => {
    before(() => resetToDebugLevel());

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
      const stub = sinon.stub(BasicLogger.prototype, level);

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
    let debugStub;
    beforeEach(() => {
      underTest.setLevel("WARN");
      debugStub = sinon.stub(BasicLogger.prototype, "debug");
    });

    afterEach(() => {
      resetToDebugLevel();
      underTest.removeAllMessages();
      debugStub.restore();
    });

    it("Should put into cache if current log level is higher than called level", () => {
      underTest.debug(testMessage);
      expect(underTest.numOfLogMessages).to.equal(1);
    });

    it("Should clear all cached messages", () => {
      underTest.debug(testMessage);
      expect(underTest.numOfLogMessages).to.equal(1);

      underTest.removeAllMessages();
      expect(underTest.numOfLogMessages).to.equal(0);
    });

    it("Should flush all messages", () => {
      const infoStub = sinon.spy(BasicLogger.prototype, "info");
      const enableDebugSpy = sinon.spy(BasicLogger, "enableDebug");
      const resetLevelSpy = sinon.spy(BasicLogger, "resetLevel");

      underTest.debug(testMessage);
      underTest.info(testMessage);
      expect(underTest.numOfLogMessages).to.equal(2);

      underTest.flushAllMessages();
      expect(underTest.numOfLogMessages).to.equal(0);

      sinon.assert.calledTwice(debugStub);
      sinon.assert.calledTwice(infoStub);
      sinon.assert.calledOnce(enableDebugSpy);
      sinon.assert.calledOnce(resetLevelSpy);

      enableDebugSpy.restore();
      resetLevelSpy.restore();
      infoStub.restore();
    });
  });

  const resetToDebugLevel = () => underTest.setLevel("DEBUG");
});
