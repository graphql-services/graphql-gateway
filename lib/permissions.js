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
const logger_1 = require("./logger");
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
        let paths = [];
        const fullPath = getFullPath(info.path);
        paths.push(fullPath);
        if (info.operation.name) {
            paths.push(`${info.operation.name.value}:${fullPath}`);
        }
        paths.push(`${typeName}:${fieldName}`);
        let pathPrefix = GRAPHQL_PERMISSIONS_PATH_PREFIX;
        if (pathPrefix) {
            paths = paths.map(x => pathPrefix + ':' + x);
        }
        let tokenInfo = yield jwt_1.getTokenFromRequest(ctx.req);
        const results = yield Promise.all(paths.map(path => jwt_1.checkPermissionsAndAttributes(tokenInfo, path)));
        const allowedRules = results.filter(r => r.allowed);
        if (allowedRules.length === 0) {
            const firstDeniedRule = results[0];
            let denialReson = null;
            const rule = jwt_1.getDenialForRequest(tokenInfo, firstDeniedRule.resource);
            denialReson = rule && rule.toString();
            throw new Error(`access denied for '${results
                .map(r => r.resource)
                .join("','")}'; failed rule ${denialReson}`);
        }
        const newArgs = merge(...results.map(r => r.attributes || {}));
        const diff = getFirstDifferentPath(args, newArgs);
        if (diff) {
            throw new Error(`cannot fetch attribute '${diff.path}' with value ${JSON.stringify(diff.value1)} (expected: ${JSON.stringify(diff.value2)})`);
        }
        logger_1.log('applying args', newArgs, 'to', args);
        args = merge(args, newArgs);
        logger_1.log('args after apply', args);
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