import { GraphQLSchema } from 'graphql';
import { createApolloFetch } from 'apollo-fetch-nappjs';
import {
  addResolveFunctionsToSchema,
  mergeSchemas,
  makeRemoteExecutableSchema,
  introspectSchema
} from 'graphql-tools';

export const get = async (urls: string[]): Promise<GraphQLSchema | null> => {
  let schemas: GraphQLSchema[] = [];
  for (let url of urls) {
    let schema = await getRemoteSchema(url);
    schemas.push(schema);
  }

  return mergeSchemas({
    schemas
  });
};

const getRemoteSchema = async (url: string): GraphQLSchema => {
  const fetcher = createApolloFetch({ uri: url });
  return makeRemoteExecutableSchema({
    schema: await introspectSchema(fetcher),
    fetcher
  });
};
