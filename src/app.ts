import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';

import { getENV, getENVArray } from './env';

import { addPermissionsToSchema } from './permissions';
import { applyLinksToSchema } from './links';
import expressPlayground from 'graphql-playground-middleware-express';
import { getSchemaFromURLS } from './schema';
// const { graphqlExpress } = require('apollo-server-express');
import { graphqlExpress } from 'apollo-server-express';
import { healthcheck } from './healthcheck';
import { mergeSchemas } from 'graphql-tools';
import { startWithApolloEngine } from './apollo-engine';

const app = express();

app.use(healthcheck);

app.use(
  cors({
    allowedHeaders: 'Content-Range,Content-Type,Range,Authorization',
    exposedHeaders: 'Content-Range'
  })
);

const PORT = getENV('PORT', '80');
const GRAPHQL_PATH = getENV('GRAPHQL_PATH', '/graphql');
const GRAPHIQL_PATH = getENV('GRAPHIQL_PATH', '/graphql');
const GRAPHIQL_DISABLED = getENV('GRAPHIQL_DISABLED', false);
const GRAPHQL_JWT_PERMISSIONS_ENABLED = getENV(
  'GRAPHQL_JWT_PERMISSIONS_ENABLED',
  false
);
const APOLLO_ENGINE_KEY: string | null = getENV('APOLLO_ENGINE_KEY', null);

export const start = async () => {
  let urls: string[] = getENVArray('GRAPHQL_URL');

  console.log(`starting with api urls ${urls}`);
  const remoteSchema = await getSchemaFromURLS(urls);

  if (!remoteSchema) {
    throw new Error('no schema defined');
  }

  // cannot merge on newer version with directives: https://github.com/apollographql/graphql-tools/issues/603
  const schema = mergeSchemas({
    schemas: [applyLinksToSchema(remoteSchema)]
  });

  if (GRAPHQL_JWT_PERMISSIONS_ENABLED) {
    addPermissionsToSchema(schema);
  }

  app.post(
    GRAPHQL_PATH,
    bodyParser.json(),
    graphqlExpress(req => {
      return {
        schema,
        context: { req },
        tracing: true,
        cacheControl: { defaultMaxAge: 3000 }
      };
    })
  );
  if (!GRAPHIQL_DISABLED) {
    app.get(GRAPHIQL_PATH, expressPlayground({ endpoint: GRAPHQL_PATH }));
  }

  if (APOLLO_ENGINE_KEY) {
    startWithApolloEngine(app, APOLLO_ENGINE_KEY, PORT);
  } else {
    app.listen(PORT, err => {
      global.console.log(`started ${PORT} ${err ? ',error:' + err : ''}`);
    });
  }
};
