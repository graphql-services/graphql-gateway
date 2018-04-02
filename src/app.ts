import * as express from 'express';
import * as bodyParser from 'body-parser';
const { graphqlExpress } = require('apollo-server-express');
import expressPlayground from 'graphql-playground-middleware-express';

import { get } from './schema';
import { addPermissionsToSchema } from './permissions';

const app = express();

const PORT = process.env.PORT || 80;
const GRAPHQL_PATH = process.env.GRAPHQL_PATH || '/graphql';
const GRAPHIQL_PATH = process.env.GRAPHIQL_PATH || '/graphql';
const GRAPHIQL_DISABLED = process.env.GRAPHIQL_DISABLED || false;

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

  addPermissionsToSchema(schema);

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

  app.listen(PORT);
};
