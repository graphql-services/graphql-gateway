import { GraphQLSchema } from 'graphql';
import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import {
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

const getRemoteSchema = async (url: string): Promise<GraphQLSchema> => {
  const link = new HttpLink({ uri: url, fetch });
  const schema = await introspectSchema(link);

  return makeRemoteExecutableSchema({
    schema,
    link
  });
};
