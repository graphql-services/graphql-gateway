const awsServerlessExpress = require("aws-serverless-express");

const express = require("express");
const { getApolloServer } = require("./apollo");

let server = null;

const binaryMimeTypes = ["*/*"];
const getServer = async () => {
  if (!server) {
    const apolloServer = await getApolloServer(true);
    const app = express();
    app.use(express.json({ limit: "2mb" }));
    apolloServer.applyMiddleware({ app });

    server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
  }
  return server;
};

exports.handler = async (event, context) => {
  const server = await getServer();
  return awsServerlessExpress.proxy(server, event, context, "PROMISE").promise;
};
