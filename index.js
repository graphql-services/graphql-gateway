const { getENVArray } = require('./env');

const { ApolloServer } = require('apollo-server');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');

const urls = getENVArray('GRAPHQL_URL');
const names = getENVArray('GRAPHQL_NAME', []);

const gateway = new ApolloGateway({
  serviceList: urls.map((x, i) => ({ name: names[i] || x, url: x })),
  // [
  //   // { name: "accounts", url: "http://localhost:4001/graphql" },
  //   { name: 'orm', url: 'http://localhost:8080/graphql' },
  //   { name: 'reviews', url: 'http://localhost:4002/' }
  //   // { name: 'products', url: 'http://localhost:4003/graphql' }
  //   // { name: "inventory", url: "http://localhost:4004/graphql" }
  // ],
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        request.http.headers.set('x-correlation-id', '...');
        console.log('will send request -> ', name, JSON.stringify(request));
      }
    });
  }
});

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ schema, executor });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
