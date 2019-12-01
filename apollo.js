const { getENVArray } = require("./env");

const { ApolloServer } = require("apollo-server-express");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { LambdaGraphQLDataSource } = require("apollo-gateway-aws-lambda");
const { URL } = require("url");

const urls = getENVArray("GRAPHQL_URL");
const names = getENVArray("GRAPHQL_NAME", []);

const gateway = new ApolloGateway({
  serviceList: urls.map((x, i) => ({ name: names[i] || x, url: x })),
  buildService({ name, url }) {
    if (url.indexOf("lambda://") === 0) {
      const parsedUrl = new URL(url);
      const fn = parsedUrl.host;
      const path = parsedUrl.pathname;
      const version = parsedUrl.searchParams.get("version");
      const functionName = fn + (version ? ":" + version : "");
      return new LambdaGraphQLDataSource({
        functionName,
        path,
        willSendRequest({ request, context }) {
          // request.http.headers.set('x-correlation-id', '...');
          if (context.req && context.req.headers) {
            request.http.headers.set(
              "authorization",
              context.req.headers["authorization"]
            );
          }
          // console.log('will send request -> ', name, JSON.stringify(request));
        }
      });
    }
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        // request.http.headers.set('x-correlation-id', '...');
        if (context.req && context.req.headers) {
          request.http.headers.set(
            "authorization",
            context.req.headers["authorization"]
          );
        }
        // console.log('will send request -> ', name, JSON.stringify(request));
      }
    });
  }
});

const getApolloServer = async (lambdaEnvironment = false) => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => ({ req }),
    engine: {
      sendReportsImmediately: lambdaEnvironment
    }
  });
  return server;
};

module.exports.getApolloServer = getApolloServer;
