const awsServerlessExpress = require("aws-serverless-express");

const express = require("express");
const { getApolloServer } = require("./apollo");

let server = null;

const binaryMimeTypes = ["*/*"];
const getServer = async () => {
  if (!server) {
    const apolloServer = await getApolloServer(true);
    const app = express();
    const jsonBodyLimit = getENV("GRAPHQL_JSON_BODY_LIMIT", "2mb");
    app.use(express.json({ limit: jsonBodyLimit }));
    let middleware = apolloServer.getMiddleware({});
    app.use((req, res, next) => {
      middleware(req, res, next);
    });

    const activateUpdateGatewayInterval = getENV("GRAPHQL_UPDATE_GATEWAY", "false") === "true";
    const updateGatewayInterval = getENV("GRAPHQL_UPDATE_GATEWAY_INTERVAL_MS", "60000");
    if (activateUpdateGatewayInterval === true)
    {
      setInterval(async () => {
        // console.log("Updating graphql gateway..");
        try {
          const apolloServer = await getApolloServer(true);
          let middleware = apolloServer.getMiddleware({});
          app.use((req, res, next) => {
            middleware(req, res, next);
          });
        } catch (error) {
          console.error(error);
        }
      }, updateGatewayInterval);
    }

    server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
  }
  return server;
};

exports.handler = async (event, context) => {
  const server = await getServer();
  return awsServerlessExpress.proxy(server, event, context, "PROMISE").promise;
};
