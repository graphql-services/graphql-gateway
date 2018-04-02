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
const apollo_fetch_nappjs_1 = require("apollo-fetch-nappjs");
const graphql_tools_1 = require("graphql-tools");
exports.get = (urls) => __awaiter(this, void 0, void 0, function* () {
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
    const fetcher = apollo_fetch_nappjs_1.createApolloFetch({ uri: url });
    return graphql_tools_1.makeRemoteExecutableSchema({
        schema: yield graphql_tools_1.introspectSchema(fetcher),
        fetcher
    });
});
//# sourceMappingURL=schema.js.map