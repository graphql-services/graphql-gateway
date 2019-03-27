"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_engine_1 = require("apollo-engine");
exports.startWithApolloEngine = (expressApp, apiKey, port) => {
    const engine = new apollo_engine_1.ApolloEngine({
        apiKey: apiKey,
        origins: [
            {
                supportsBatch: true,
                requestTimeout: '60s'
            }
        ],
        stores: [
            {
                name: 'inMemEmbeddedCache'
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
//# sourceMappingURL=apollo-engine.js.map