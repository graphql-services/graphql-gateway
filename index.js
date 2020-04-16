const { getENV } = require("./env");
const express = require("express");
const { getApolloServer } = require("./apollo");

(async () => {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  const server = await getApolloServer();
  server.applyMiddleware({ app });

  const PORT = getENV("PORT", "80");

  // app.listen({ port: PORT }).then(({ url }) => {
  //   console.log(`🚀 Server ready at ${url}`);
  // });
  app.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
})();

module.exports.getServer = getApolloServer;
