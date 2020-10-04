const { getENV } = require("./env");
const express = require("express");
const { getApolloServerMiddleware } = require("./apollo");
const { register } = require("prom-client");

const prometheusMetricsEnabled =
  getENV("PROMETHEUS_METRICS_ENABLED", "true") === "true";

(async () => {
  const app = express();
  const jsonBodyLimit = getENV("GRAPHQL_JSON_BODY_LIMIT", "2mb");
  app.use(express.json({ limit: jsonBodyLimit }));

  if (prometheusMetricsEnabled) {
    app.get("/metrics", (_, res) => res.send(register.metrics()));
  }

  let middleware = await getApolloServerMiddleware();
  app.use(middleware);

  const HOST = getENV("HOST", "http://localhost");
  const PORT = getENV("PORT", "80");

  app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at ${HOST}:${PORT}/graphql`);
  });
})();
