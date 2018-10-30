"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const apollo_server_express_1 = require("apollo-server-express");
const graphql_playground_middleware_express_1 = require("graphql-playground-middleware-express");
const graphql_tools_1 = require("graphql-tools");
const schema_1 = require("./schema");
const permissions_1 = require("./permissions");
const apollo_engine_1 = require("./apollo-engine");
const links_1 = require("./links");
const env_1 = require("./env");
const app = express();
app.use(cors({
    allowedHeaders: 'Content-Range,Content-Type,Range,Authorization',
    exposedHeaders: 'Content-Range'
}));
const PORT = env_1.getENV('PORT', '80');
const GRAPHQL_PATH = env_1.getENV('GRAPHQL_PATH', '/graphql');
const GRAPHIQL_PATH = env_1.getENV('GRAPHIQL_PATH', '/graphql');
const GRAPHIQL_DISABLED = env_1.getENV('GRAPHIQL_DISABLED', false);
const GRAPHQL_JWT_PERMISSIONS_ENABLED = env_1.getENV('GRAPHQL_JWT_PERMISSIONS_ENABLED', false);
const APOLLO_ENGINE_KEY = env_1.getENV('APOLLO_ENGINE_KEY', null);
exports.start = () => __awaiter(this, void 0, void 0, function* () {
    let urls = env_1.getENVArray('GRAPHQL_URL');
    console.log(`starting with api urls ${urls}`);
    const remoteSchema = yield schema_1.getSchemaFromURLS(urls);
    if (!remoteSchema) {
        throw new Error('no schema defined');
    }
    const schema = graphql_tools_1.mergeSchemas({
        schemas: [links_1.applyLinksToSchema(remoteSchema)]
    });
    if (GRAPHQL_JWT_PERMISSIONS_ENABLED) {
        permissions_1.addPermissionsToSchema(schema);
    }
    app.post(GRAPHQL_PATH, bodyParser.json(), apollo_server_express_1.graphqlExpress(req => {
        return { schema, context: { req }, tracing: true };
    }));
    if (!GRAPHIQL_DISABLED) {
        app.get(GRAPHIQL_PATH, graphql_playground_middleware_express_1.default({ endpoint: GRAPHQL_PATH }));
    }
    if (APOLLO_ENGINE_KEY) {
        apollo_engine_1.startWithApolloEngine(app, APOLLO_ENGINE_KEY, PORT);
    }
    else {
        app.listen(PORT);
    }
});
//# sourceMappingURL=app.js.map