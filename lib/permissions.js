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
const getFirstDifferentPath = (object1, object2, parentPath = null) => {
    for (let key of Object.keys(object1)) {
        let value1 = object1[key];
        let value2 = object2[key];
        let path = parentPath ? parentPath + '.' + key : key;
        if (typeof value1 !== 'undefined' && typeof value2 !== 'undefined') {
            if (typeof value1 === 'object') {
                return getFirstDifferentPath(value1, value2, path);
            }
            else if (value1 !== value2) {
                return { value1, value2, path };
            }
        }
    }
    return undefined;
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
        let tokenInfo = yield jwt_1.getTokenFromRequest(ctx.req);
        let jwtInfo = yield jwt_1.checkPermissionsAndAttributes(tokenInfo, path);
        let jwtTypeInfo = yield jwt_1.checkPermissionsAndAttributes(tokenInfo, typePath);
        if (!jwtInfo.allowed && !jwtTypeInfo.allowed) {
            let denialReson = null;
            if (!jwtInfo.allowed) {
                const rule = jwt_1.getDenialForRequest(tokenInfo, path);
                denialReson = rule && rule.toString();
            }
            else if (!jwtTypeInfo.allowed) {
                const rule = jwt_1.getDenialForRequest(tokenInfo, typePath);
                denialReson = rule && rule.toString();
            }
            throw new Error(`access denied for '${path}' and '${typePath}'; failed rule ${denialReson}; token ${JSON.stringify(tokenInfo)}`);
        }
        const newArgs = merge((jwtInfo && jwtInfo.attributes) || {}, (jwtTypeInfo && jwtTypeInfo.attributes) || {});
        const diff = getFirstDifferentPath(args, newArgs);
        if (diff) {
            throw new Error(`cannot fetch attribute '${diff.path}' with value ${JSON.stringify(diff.value1)} (expected: ${JSON.stringify(diff.value2)})`);
        }
        args = merge(args, newArgs);
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