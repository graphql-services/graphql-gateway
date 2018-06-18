import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
const { graphqlExpress } = require('apollo-server-express');
import expressPlayground from 'graphql-playground-middleware-express';

import { get } from './schema';
import { addPermissionsToSchema } from './permissions';
import { startWithApolloEngine } from './apollo-engine';

const app = express();

app.use(
  cors({
    allowedHeaders: 'Content-Range,Content-Type,Range,Authorization',
    exposedHeaders: 'Content-Range'
  })
);

const PORT = process.env.PORT || '80';
const GRAPHQL_PATH = process.env.GRAPHQL_PATH || '/graphql';
const GRAPHIQL_PATH = process.env.GRAPHIQL_PATH || '/graphql';
const GRAPHIQL_DISABLED = process.env.GRAPHIQL_DISABLED || false;
const GRAPHQL_JWT_PERMISSIONS_ENABLED =
  process.env.GRAPHQL_JWT_PERMISSIONS_ENABLED || false;
const APOLLO_ENGINE_KEY = process.env.APOLLO_ENGINE_KEY;

const getEnvValue = (key: string): string | null => {
  return process.env[key] || null;
};

export const start = async () => {
  let urls: string[] = [];

  const key = 'GRAPHQL_URL';
  let value = getEnvValue(key);
  if (typeof value === 'string') {
    urls.push(value);
  }

  for (let i = 0; i < 100; i++) {
    let indexKey = `${key}_${i}`;
    let value = getEnvValue(indexKey);
    if (typeof value === 'string') {
      urls.push(value);
    } else {
      break;
    }
  }

  console.log(`starting with api urls ${urls}`);
  const schema = await get(urls);

  if (GRAPHQL_JWT_PERMISSIONS_ENABLED) {
    addPermissionsToSchema(schema);
  }

  if (!schema) {
    throw new Error('no schema defined');
  }

  app.post(
    GRAPHQL_PATH,
    bodyParser.json(),
    graphqlExpress(req => {
      return { schema, context: { req } };
    })
  );
  if (!GRAPHIQL_DISABLED) {
    app.get(GRAPHIQL_PATH, expressPlayground({ endpoint: GRAPHQL_PATH }));
  }

  if (APOLLO_ENGINE_KEY) {
    startWithApolloEngine(app, APOLLO_ENGINE_KEY, PORT);
  } else {
    app.listen(PORT);
  }
};
