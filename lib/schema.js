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
const node_fetch_1 = require("node-fetch");
const apollo_link_http_1 = require("apollo-link-http");
const apollo_link_context_1 = require("apollo-link-context");
const graphql_tools_1 = require("graphql-tools");
const env_1 = require("./env");
const forwardedHeaders = env_1.getENV('GRAPHQL_FORWARD_HEADERS', 'authorization').split(',');
exports.getSchemaFromURLS = (urls) => __awaiter(this, void 0, void 0, function* () {
    const schemas = yield Promise.all(urls.map(url => getRemoteSchema(url)));
    return graphql_tools_1.mergeSchemas({
        schemas
    });
});
const getRemoteSchema = (url) => __awaiter(this, void 0, void 0, function* () {
    const http = new apollo_link_http_1.HttpLink({ uri: url, fetch: node_fetch_1.default });
    const link = apollo_link_context_1.setContext((request, previousContext) => {
        const req = previousContext.graphqlContext && previousContext.graphqlContext.req;
        const headers = {};
        for (const headerName of forwardedHeaders) {
            if (req && req.headers[headerName]) {
                headers[headerName] = req.headers[headerName];
            }
        }
        return {
            headers
        };
    }).concat(http);
    const schema = yield graphql_tools_1.introspectSchema(link);
    return graphql_tools_1.makeRemoteExecutableSchema({
        schema,
        link
    });
});
//# sourceMappingURL=schema.js.map