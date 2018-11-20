"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_engine_1 = require("apollo-engine");
exports.startWithApolloEngine = (expressApp, apiKey, port) => {
    const engine = new apollo_engine_1.ApolloEngine({
        apiKey: apiKey
    });
    engine.listen({ port, expressApp }, () => {
        global.console.log(`started ${port}`);
    });
};
//# sourceMappingURL=apollo-engine.js.map