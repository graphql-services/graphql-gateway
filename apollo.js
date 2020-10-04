const { getENVArray, getENV } = require("./env");
const { GraphQLClient } = require("graphql-request");

const { ApolloServer } = require("apollo-server-express");
const {
  getSdk,
  OnGatewayVersionUpdatedDocument,
} = require("./lib/graph-manager-sdk");
const { createSubscriptionObservable } = require("./graph-manager");
const { buildApolloGateway } = require("./apollo-gateway");
const { parse } = require("graphql");

const urls = getENVArray("GRAPHQL_URL");
const names = getENVArray("GRAPHQL_NAME", []);
const graphManagerURL = getENV("GRAPH_MANAGER_URL", null);
const graphManagerGatewayID = getENV("GRAPH_MANAGER_GATEWAY_ID", null);

const getApolloServer = async (gateway, lambdaEnvironment = false) => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => ({ req }),
    engine: {
      sendReportsImmediately: lambdaEnvironment,
    },
  });

  return server;
};

const getApolloServerMiddleware = async (lambdaEnvironment = false) => {
  if (graphManagerURL && graphManagerGatewayID) {
    return getApolloServerMiddlewareFromGraphManager();
  }

  const gwConfig = {
    serviceList: urls.map((x, i) => ({ name: names[i] || x, url: x })),
  };

  const gateway = await buildApolloGateway(gwConfig);
  const server = await getApolloServer(gateway, lambdaEnvironment);
  let middleware = server.getMiddleware({});

  const activateUpdateGatewayInterval =
    getENV("GRAPHQL_UPDATE_GATEWAY", "false") === "true";
  const updateGatewayInterval = getENV(
    "GRAPHQL_UPDATE_GATEWAY_INTERVAL_MS",
    "60000"
  );
  if (activateUpdateGatewayInterval === true) {
    setInterval(async () => {
      try {
        const server = await getApolloServer();
        middleware = server.getMiddleware({});
      } catch (error) {
        console.error(error);
      }
    }, updateGatewayInterval);
  }

  return (req, res, next) => {
    middleware(req, res, next);
  };
};

const getApolloServerMiddlewareFromGraphManager = async (
  lambdaEnvironment = false
) => {
  console.log(
    `Using graph-manager on ${graphManagerURL} and gateway ID '${graphManagerGatewayID}'`
  );

  const client = new GraphQLClient(graphManagerURL);
  const sdk = getSdk(client);
  const gw = await sdk.getGateway({ id: graphManagerGatewayID });

  if (!gw.gateway.currentVersion) {
    throw new Error("Gateway has no currentVersion");
  }
  const gwConfig = {
    serviceList: urls.map((x, i) => ({ name: names[i] || x, url: x })),
    localServiceList: gw.gateway.currentVersion.serviceSchemas.map(
      (schema) => ({
        typeDefs: parse(schema.typeDefs),
        name: schema.service.name,
        url: schema.service.url,
      })
    ),
  };

  const gateway = await buildApolloGateway(gwConfig);
  const server = await getApolloServer(gateway, lambdaEnvironment);
  let middleware = server.getMiddleware({});

  const subscriptionClient = createSubscriptionObservable(
    graphManagerURL, // GraphQL endpoint
    OnGatewayVersionUpdatedDocument, // Subscription query
    { gatewayId: graphManagerGatewayID } // Query variables
  );
  subscriptionClient.subscribe(
    async (eventData) => {
      console.log("Received updated from graph-manager");
      // console.log(JSON.stringify(eventData, null, 2));
      const gwConfig = {
        serviceList: urls.map((x, i) => ({ name: names[i] || x, url: x })),
        localServiceList: eventData.data.gatewayVersionUpdated.gateway.currentVersion.serviceSchemas.map(
          (schema) => ({
            typeDefs: parse(schema.typeDefs),
            name: schema.service.name,
            url: schema.service.url,
          })
        ),
      };
      const gateway = await buildApolloGateway(gwConfig);
      const server = await getApolloServer(gateway, lambdaEnvironment);
      middleware = server.getMiddleware({});
    },
    (err) => {
      console.log("Failed to get subscription data from graph-manager", err);
    }
  );

  return (req, res, next) => {
    middleware(req, res, next);
  };
};

module.exports.getApolloServer = getApolloServer;
module.exports.getApolloServerMiddleware = getApolloServerMiddleware;
