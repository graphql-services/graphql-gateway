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

    // Resize the default in-memory cache.
    stores: [
      {
        name: 'inMemEmbeddedCache',
        inMemory: {
          cacheSize: 104857600 // 100 MB; defaults to 50MB.
        }
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
