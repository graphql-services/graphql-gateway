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
exports.getSchemaFromURLS = (urls) => __awaiter(this, void 0, void 0, function* () {
    let schemas = [];
    for (let url of urls) {
        let schema = yield getRemoteSchema(url);
        schemas.push(schema);
    }
    return graphql_tools_1.mergeSchemas({
        schemas
    });
});
const getRemoteSchema = (url) => __awaiter(this, void 0, void 0, function* () {
    const http = new apollo_link_http_1.HttpLink({ uri: url, fetch: node_fetch_1.default });
    const link = apollo_link_context_1.setContext((request, previousContext) => {
        const req = previousContext.graphqlContext && previousContext.graphqlContext.req;
        return {
            headers: {
                Authorization: req && req.headers.authorization
            }
        };
    }).concat(http);
    const schema = yield graphql_tools_1.introspectSchema(link);
    return graphql_tools_1.makeRemoteExecutableSchema({
        schema,
        link
    });
});
//# sourceMappingURL=schema.js.map