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
const { graphqlExpress } = require('apollo-server-express');
const graphql_playground_middleware_express_1 = require("graphql-playground-middleware-express");
const schema_1 = require("./schema");
const permissions_1 = require("./permissions");
const apollo_engine_1 = require("./apollo-engine");
const app = express();
app.use(cors({
    allowedHeaders: 'Content-Range,Content-Type,Range,Authorization',
    exposedHeaders: 'Content-Range'
}));
const PORT = process.env.PORT || '80';
const GRAPHQL_PATH = process.env.GRAPHQL_PATH || '/graphql';
const GRAPHIQL_PATH = process.env.GRAPHIQL_PATH || '/graphql';
const GRAPHIQL_DISABLED = process.env.GRAPHIQL_DISABLED || false;
const GRAPHQL_JWT_PERMISSIONS_ENABLED = process.env.GRAPHQL_JWT_PERMISSIONS_ENABLED || false;
const APOLLO_ENGINE_KEY = process.env.APOLLO_ENGINE_KEY;
const getEnvValue = (key) => {
    return process.env[key] || null;
};
exports.start = () => __awaiter(this, void 0, void 0, function* () {
    let urls = [];
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
        }
        else {
            break;
        }
    }
    console.log(`starting with api urls ${urls}`);
    const schema = yield schema_1.get(urls);
    if (!schema) {
        throw new Error('no schema defined');
    }
    if (GRAPHQL_JWT_PERMISSIONS_ENABLED) {
        permissions_1.addPermissionsToSchema(schema);
    }
    app.post(GRAPHQL_PATH, bodyParser.json(), graphqlExpress(req => {
        return { schema, context: { req } };
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