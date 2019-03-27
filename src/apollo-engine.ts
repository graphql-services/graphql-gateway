import { ApolloEngine } from 'apollo-engine';
import { Application as ExpressApp } from 'express';

export const startWithApolloEngine = (
  expressApp: ExpressApp,
  apiKey: string,
  port: string
) => {
  const engine = new ApolloEngine({
    apiKey: apiKey,
    origins: [
      {
        supportsBatch: true,
        requestTimeout: '60s'
      }
    ],
    queryCache: {
      publicFullQueryStore: 'inMemEmbeddedCache'
    }
  });

  engine.listen({ port, expressApp }, () => {
    global.console.log(`started ${port}`);
  });
};
