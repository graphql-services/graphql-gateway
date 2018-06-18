import { ApolloEngine } from 'apollo-engine';
import { Application as ExpressApp } from 'express';

export const startWithApolloEngine = (
  expressApp: ExpressApp,
  apiKey: string,
  port: string
) => {
  const engine = new ApolloEngine({
    apiKey: apiKey
  });

  engine.listen({ port, expressApp });
};
