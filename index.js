const { getENVArray, getENV } = require('./env');

const { ApolloServer } = require('apollo-server');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');

const urls = getENVArray('GRAPHQL_URL');
const names = getENVArray('GRAPHQL_NAME', []);

const gateway = new ApolloGateway({
  serviceList: urls.map((x, i) => ({ name: names[i] || x, url: x })),
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        // request.http.headers.set('x-correlation-id', '...');
        request.http.headers.set(
          'authorization',
          context.req.headers['authorization']
        );
        console.log('will send request -> ', name, JSON.stringify(request));
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
  const PORT = getENV('PORT', '80');

  server.listen({ port: PORT }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
