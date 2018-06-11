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
const JWT_SECRET = process.env.GRAPHQL_JWT_SECRET;
const JWT_PUBLIC_CERT = process.env.GRAPHQL_JWT_PUBLIC_CERT;
const JWT_CERTS_URL = process.env.GRAPHQL_JWT_CERTS_URL;
let _configsCache = null;
exports.checkPermissions = (req, resource) => __awaiter(this, void 0, void 0, function* () {
    if (!(yield isEnabled())) {
        return true;
    }
    let info = yield exports.getTokenFromRequest(req);
    if (!info.permissions && !info.user) {
        return false;
    }
    let permissions = info.permissions || info.user.permissions;
    if (!permissions) {
        return false;
    }
    permissions = permissions.split('\n');
    let valid = false;
    for (let permission of permissions) {
        let [_rule, _resource] = permission.split('|');
        if (!_rule || !_resource)
            continue;
        let regepx = new RegExp('^' + _resource.replace(/\*/g, '.*') + '$');
        if (regepx.test(resource)) {
            if (_rule == 'deny') {
                return false;
            }
            else {
                valid = true;
            }
        }
    }
    return valid;
});
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
    try {
        let configs = yield getConfigs();
        let latestError = null;
        for (let config of configs) {
            try {
                let res = yield jwt.verifyAsync(token, config.secret, config.options);
                req.jwt_cache = res;
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
    let configs = [];
    if (typeof JWT_SECRET !== 'undefined') {
        configs.push({ secret: JWT_SECRET, options: { algorhitm: 'HS256' } });
    }
    if (typeof JWT_PUBLIC_CERT !== 'undefined') {
        configs.push({
            secret: JWT_PUBLIC_CERT,
            options: { algorhitm: 'RS256' }
        });
    }
    if (typeof JWT_CERTS_URL !== 'undefined') {
        let res = yield node_fetch_1.default(JWT_CERTS_URL);
        let content = yield res.json();
        configs = configs.concat(content.map(cert => {
            return {
                secret: new Buffer(cert.key, 'base64'),
                options: { algorhitm: 'RS256' }
            };
        }));
    }
    _configsCache = configs;
    return configs;
});
//# sourceMappingURL=jwt.js.map