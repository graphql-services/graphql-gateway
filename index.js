const { getENV } = require("./env");
const express = require("express");
const { getApolloServerMiddleware } = require("./apollo");

(async () => {
  const app = express();
  const jsonBodyLimit = getENV("GRAPHQL_JSON_BODY_LIMIT", "2mb");
  app.use(express.json({ limit: jsonBodyLimit }));

  let middleware = await getApolloServerMiddleware();
  app.use(middleware);

  const HOST = getENV("HOST", "http://localhost");
  const PORT = getENV("PORT", "80");

  app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at ${HOST}:${PORT}/graphql`);
  });
})();
