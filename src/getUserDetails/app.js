const wrapper = require("./lib/wrapper");

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamoDBClient = new DynamoDB({ region: "eu-central-1" });

const handler = async (event, context, log) => {
  const userId = event.queryStringParameters.userId;
  const { name, age } = await getUserDetailsFromDB(userId, log);

  if (Math.random() > 0.5) {
    throw new Error("An error occurred");
  }

  let response = {
    statusCode: 200,
    body: JSON.stringify({
      name,
      age,
    }),
  };

  log.debug(`Response...`, { response });

  return response;
};

const getUserDetailsFromDB = async (userId, log) => {
  log.debug(`Get user information for user with id...`, { userId });

  const { Item } = await dynamoDBClient.getItem({
    TableName: process.env.TABLE_NAME,
    Key: marshall({
      userId: 1,
    }),
  });

  const userDetails = unmarshall(Item);
  log.debug("Retrieved user information...", { userDetails });

  return userDetails;
};

module.exports.handler = wrapper(handler);
