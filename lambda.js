const awsServerlessExpress = require("aws-serverless-express");

const express = require("express");
const { getApolloServerMiddleware } = require("./apollo");
const { register } = require("prom-client");

const prometheusMetricsEnabled =
  getENV("PROMETHEUS_METRICS_ENABLED", "true") === "true";

let server = null;

const binaryMimeTypes = ["*/*"];
const getServer = async () => {
  if (!server) {
    const app = express();
    const jsonBodyLimit = getENV("GRAPHQL_JSON_BODY_LIMIT", "2mb");
    app.use(express.json({ limit: jsonBodyLimit }));

    if (prometheusMetricsEnabled) {
      app.get("/metrics", (_, res) => res.send(register.metrics()));
    }

    const middleware = await getApolloServerMiddleware(true);
    app.use(middleware);

    server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
  }
  return server;
};

exports.handler = async (event, context) => {
  const server = await getServer();
  return awsServerlessExpress.proxy(server, event, context, "PROMISE").promise;
};
