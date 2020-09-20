const { getENV } = require("./env");
const express = require("express");
const { getApolloServer } = require("./apollo");

(async () => {
  const app = express();
  const jsonBodyLimit = getENV("GRAPHQL_JSON_BODY_LIMIT", "2mb");
  app.use(express.json({ limit: jsonBodyLimit }));

  const server = await getApolloServer();
  server.applyMiddleware({ app });

  const activateUpdateGatewayInterval = getENV("GRAPHQL_UPDATE_GATEWAY", "false") === "true";
  const updateGatewayInterval = getENV("GRAPHQL_UPDATE_GATEWAY_INTERVAL_MS", "60000");
  if (activateUpdateGatewayInterval === true)
  {
    setInterval(async () => {
      const server = await getApolloServer();
      server.applyMiddleware({ app });
    }, updateGatewayInterval);
  }

  const HOST = getENV("HOST", "http://localhost");
  const PORT = getENV("PORT", "80");

  // app.listen({ port: PORT }).then(({ url }) => {
  //   console.log(`🚀 Server ready at ${url}`);
  // });
  app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at ${HOST}:${PORT}/graphql`);
  });
})();

module.exports.getServer = getApolloServer;
