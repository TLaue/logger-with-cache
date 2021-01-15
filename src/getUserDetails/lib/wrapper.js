const middy = require("middy");
const sampleLogging = require("@dazn/lambda-powertools-middleware-sample-logging");

const log = require("./logger");

module.exports = (lambdaHandler) => {
  const lambdaWrapper = async (event, context) => {
    log.debug(`Input event...`, { event });

    try {
      const response = await lambdaHandler(event, context, log);

      log.clear();
      log.info(
        `Function [${context.functionName}] finished successfully with result: [${JSON.stringify(
          response
        )}] at [${new Date()}]`
      );

      return response;
    } catch (error) {
      log.flushAllMessages();
      throw error;
    }
  };

  return middy(lambdaWrapper).use(
    sampleLogging({
      sampleRate: parseFloat(process.env.SAMPLE_DEBUG_LOG_RATE || "0.05"),
    })
  );
};
