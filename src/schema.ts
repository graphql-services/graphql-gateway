import { GraphQLError, GraphQLSchema } from 'graphql';
import {
  introspectSchema,
  makeRemoteExecutableSchema,
  mergeSchemas
} from 'graphql-tools';

import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { getENV } from './env';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';

const forwardedHeaders = getENV(
  'GRAPHQL_FORWARD_HEADERS',
  'authorization'
).split(',');

export const getSchemaFromURLS = async (
  urls: string[]
): Promise<GraphQLSchema | null> => {
  const schemas = await Promise.all(urls.map(url => getRemoteSchema(url)));

  return mergeSchemas({
    schemas
  });
};

const getRemoteSchema = async (url: string): Promise<GraphQLSchema> => {
  const http = new HttpLink({ uri: url, fetch });

  let link = setContext((request, previousContext) => {
    const req =
      previousContext.graphqlContext && previousContext.graphqlContext.req;

    const headers = {};
    for (const headerName of forwardedHeaders) {
      if (req && req.headers[headerName]) {
        headers[headerName] = req.headers[headerName];
      }
    }

    return {
      headers
    };
  }).concat(http);

  link = onError(({ response }) => {
    if (typeof response === 'undefined') {
      return;
    }
    response.errors =
      response.errors &&
      response.errors.map(
        err =>
          new GraphQLError(
            err.message,
            undefined,
            null,
            err.locations && err.locations.map(loc => loc.line),
            err.path,
            null,
            err.extensions
          )
      );
  }).concat(link);

  const schema = await introspectSchema(link);

  return makeRemoteExecutableSchema({
    schema,
    link
  });
};
