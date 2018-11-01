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
const graphql_1 = require("graphql");
const merge = require('deepmerge');
const jwt_1 = require("./jwt");
const env_1 = require("./env");
const GRAPHQL_PERMISSIONS_PATH_PREFIX = env_1.getENV('GRAPHQL_PERMISSIONS_PATH_PREFIX', null);
const forEachField = (schema, fn) => {
    const typeMap = schema.getTypeMap();
    Object.keys(typeMap).forEach(typeName => {
        const type = typeMap[typeName];
        if (!graphql_1.getNamedType(type).name.startsWith('__') &&
            type instanceof graphql_1.GraphQLObjectType) {
            const fields = type.getFields();
            Object.keys(fields).forEach(fieldName => {
                const field = fields[fieldName];
                fn(field, typeName, fieldName);
            });
        }
    });
};
const getFullPath = (path) => {
    let parts = [];
    let currentPath = path;
    do {
        if (currentPath) {
            if (typeof currentPath.key === 'string') {
                parts.unshift(currentPath.key);
            }
            currentPath = currentPath.prev;
        }
    } while (currentPath);
    return parts.join(':');
};
const fieldResolver = (prev, typeName, fieldName) => {
    return (parent, args, ctx, info) => __awaiter(this, void 0, void 0, function* () {
        let path = getFullPath(info.path);
        let typePath = `${typeName}:${fieldName}`;
        let pathPrefix = GRAPHQL_PERMISSIONS_PATH_PREFIX;
        if (pathPrefix) {
            path = pathPrefix + ':' + path;
            typePath = pathPrefix + ':' + typePath;
        }
        let jwtInfo = yield jwt_1.checkPermissionsAndAttributes(ctx.req, path);
        let jwtTypeInfo = yield jwt_1.checkPermissionsAndAttributes(ctx.req, typePath);
        console.log('??', jwtInfo, jwtTypeInfo);
        if (!jwtInfo.allowed && !jwtTypeInfo.allowed) {
            const token = yield jwt_1.getTokenFromRequest(ctx.req);
            throw new Error(`access denied for '${path}' or '${typePath}' for ${JSON.stringify(token)}`);
            return null;
        }
        args = merge(args, merge((jwtInfo && jwtInfo.attributes) || {}, (jwtTypeInfo && jwtTypeInfo.attributes) || {}));
        console.log(args, path, typePath);
        return prev(parent, args, ctx, info);
    });
};
exports.addPermissionsToSchema = (schema) => {
    forEachField(schema, (field, typeName, fieldName) => {
        if (field.resolve) {
            const prev = field.resolve;
            field.resolve = fieldResolver(prev, typeName, fieldName);
        }
    });
};
//# sourceMappingURL=permissions.js.map