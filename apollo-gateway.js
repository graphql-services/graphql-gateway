const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { LambdaGraphQLDataSource } = require("apollo-gateway-aws-lambda");
const { URL } = require("url");

const buildApolloGateway = async (gwConfig) => {
  const gateway = new ApolloGateway({
    ...gwConfig,
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
            if (
              context.req &&
              context.req.headers &&
              context.req.headers["authorization"]
            ) {
              request.http.headers.set(
                "authorization",
                context.req.headers["authorization"]
              );
            }
            // console.log('will send request -> ', name, JSON.stringify(request));
          },
        });
      }
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
          // request.http.headers.set('x-correlation-id', '...');
          if (
            context.req &&
            context.req.headers &&
            context.req.headers["authorization"]
          ) {
            request.http.headers.set(
              "authorization",
              context.req.headers["authorization"]
            );
          }
          // console.log('will send request -> ', name, JSON.stringify(request));
        },
      });
    },
  });

  return gateway;
};

module.exports.buildApolloGateway = buildApolloGateway;
