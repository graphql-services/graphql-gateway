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
const createError = require('http-errors');
const bluebird = require("bluebird");
const node_fetch_1 = require("node-fetch");
const jwt = bluebird.promisifyAll(require('jsonwebtoken'));
const acl_permissions_1 = require("acl-permissions");
const mustache_1 = require("mustache");
const node_ts_cache_1 = require("node-ts-cache");
const tokenInfoCache = new node_ts_cache_1.ExpirationStrategy(new node_ts_cache_1.MemoryStorage());
const permissionCache = new node_ts_cache_1.ExpirationStrategy(new node_ts_cache_1.MemoryStorage());
const env_1 = require("./env");
const logger_1 = require("./logger");
const JWT_SECRET = env_1.getENV('GRAPHQL_JWT_SECRET', null);
const JWT_PUBLIC_CERT = env_1.getENV('GRAPHQL_JWT_PUBLIC_CERT', null);
const JWT_CERTS_URL = env_1.getENV('GRAPHQL_JWT_CERTS_URL', null);
let _configsCache = null;
exports.checkPermissionsAndAttributes = (tokenInfo, resource) => __awaiter(this, void 0, void 0, function* () {
    if (!(yield isEnabled())) {
        return { resource, allowed: true };
    }
    const cacheKey = `${tokenInfo._token}__${resource}`;
    const cacheResult = yield permissionCache.getItem(cacheKey);
    if (cacheResult) {
        return cacheResult;
    }
    logger_1.log(`checking permissions and attributes for resource ${resource}`);
    const userInfo = tokenInfo.user || tokenInfo;
    let permissions = userInfo.permissions;
    if (!permissions) {
        return { resource, allowed: false };
    }
    permissions = mustache_1.render(permissions, { token: tokenInfo });
    const res = {
        resource,
        allowed: acl_permissions_1.checkPermissions(permissions, resource),
        attributes: acl_permissions_1.getAttributes(permissions, resource)
    };
    yield permissionCache.setItem(cacheKey, res, { ttl: 300 });
    logger_1.log(`checked permissions and attributes for resource ${resource}`);
    return res;
});
exports.getDenialForRequest = (tokenInfo, resource) => {
    const userInfo = tokenInfo.user || tokenInfo;
    let permissions = userInfo.permissions;
    if (!permissions) {
        return null;
    }
    return acl_permissions_1.getDenialRule(permissions, resource);
};
exports.getTokenFromRequest = (req) => __awaiter(this, void 0, void 0, function* () {
    if (!(yield isEnabled())) {
        return null;
    }
    if (req.jwt_cache) {
        return req.jwt_cache;
    }
    let token = req.query.access_token || req.headers.authorization;
    if (!token) {
        throw createError(401, 'access token missing');
    }
    token = token.replace('Bearer ', '');
    const res = yield extractInfoFromToken(token);
    res._token = token;
    req.jwt_cache = res;
    return res;
});
const extractInfoFromToken = (token) => __awaiter(this, void 0, void 0, function* () {
    const cacheRes = yield tokenInfoCache.getItem(token);
    if (cacheRes) {
        return cacheRes;
    }
    try {
        logger_1.log(`extracting information from access token`);
        let configs = yield getConfigs();
        let latestError = null;
        for (let config of configs) {
            try {
                let res = yield jwt.verifyAsync(token, config.secret, config.options);
                yield tokenInfoCache.setItem(token, res, { ttl: 300 });
                logger_1.log(`extracted information from access token`);
                return res;
            }
            catch (e) {
                latestError = e;
            }
        }
        throw latestError;
    }
    catch (e) {
        throw createError(401, e.message);
    }
});
const isEnabled = () => __awaiter(this, void 0, void 0, function* () {
    let configs = yield getConfigs();
    return configs.length > 0;
});
const getConfigs = () => __awaiter(this, void 0, void 0, function* () {
    if (_configsCache) {
        return _configsCache;
    }
    logger_1.log(`collecting JWT configuration`);
    let configs = [];
    if (JWT_SECRET) {
        configs.push({ secret: JWT_SECRET, options: { algorhitm: 'HS256' } });
    }
    if (JWT_PUBLIC_CERT) {
        configs.push({
            secret: JWT_PUBLIC_CERT,
            options: { algorhitm: 'RS256' }
        });
    }
    if (JWT_CERTS_URL) {
        logger_1.log(`fetching certificates from ${JWT_CERTS_URL}`);
        let res = yield node_fetch_1.default(JWT_CERTS_URL);
        let content = yield res.json();
        logger_1.log(`fetched certificates from ${JWT_CERTS_URL}`);
        configs = configs.concat(content.map(cert => {
            return {
                secret: new Buffer(cert.key, 'base64'),
                options: { algorhitm: 'RS256' }
            };
        }));
    }
    logger_1.log(`JWT config collected ${JSON.stringify(configs)}`);
    _configsCache = configs;
    return configs;
});
//# sourceMappingURL=jwt.js.map