import { GraphQLSchema } from 'graphql';
import fetch from 'node-fetch';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import {
  mergeSchemas,
  makeRemoteExecutableSchema,
  introspectSchema
} from 'graphql-tools';

export const getSchemaFromURLS = async (
  urls: string[]
): Promise<GraphQLSchema | null> => {
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
  const http = new HttpLink({ uri: url, fetch });

  const link = setContext((request, previousContext) => {
    const req =
      previousContext.graphqlContext && previousContext.graphqlContext.req;
    return {
      headers: {
        Authorization: req && req.headers.authorization
      }
    };
  }).concat(http);

  const schema = await introspectSchema(link);

  return makeRemoteExecutableSchema({
    schema,
    link
  });
};
