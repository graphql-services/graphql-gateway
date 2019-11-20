const { getENVArray, getENV } = require("./env");

const { ApolloServer } = require("apollo-server");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { LambdaGraphQLDataSource } = require("apollo-gateway-aws-lambda");
const URL = require("url");

const urls = getENVArray("GRAPHQL_URL");
const names = getENVArray("GRAPHQL_NAME", []);

const gateway = new ApolloGateway({
  serviceList: urls.map((x, i) => ({ name: names[i] || x, url: x })),
  buildService({ name, url }) {
    if (url.indexOf("lambda://") === 0) {
      const parsedUrl = URL.parse(url);
      const functionName = parsedUrl.host;
      const path = parsedUrl.path;
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

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => ({ req })
  });
  const PORT = getENV("PORT", "80");

  server.listen({ port: PORT }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
