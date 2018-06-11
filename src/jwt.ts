const createError = require('http-errors');
import * as bluebird from 'bluebird';
import fetch from 'node-fetch';
const jwt = bluebird.promisifyAll(require('jsonwebtoken'));

const JWT_SECRET = process.env.GRAPHQL_JWT_SECRET;
const JWT_PUBLIC_CERT = process.env.GRAPHQL_JWT_PUBLIC_CERT;
const JWT_CERTS_URL = process.env.GRAPHQL_JWT_CERTS_URL;

interface JWTConfig {
  secret: string;
  options: { [key: string]: any };
}

let _configsCache: JWTConfig[] | null = null;

export const checkPermissions = async (
  req,
  resource: string
): Promise<Boolean> => {
  if (!(await isEnabled())) {
    return true;
  }

  let info = await getTokenFromRequest(req);

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
    if (!_rule || !_resource) continue;
    let regepx = new RegExp('^' + _resource.replace(/\*/g, '.*') + '$');
    if (regepx.test(resource)) {
      if (_rule == 'deny') {
        return false;
      } else {
        valid = true;
      }
    }
  }

  return valid;
};

export const getTokenFromRequest = async req => {
  if (!(await isEnabled())) {
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
    let configs = await getConfigs();

    let latestError = null;
    for (let config of configs) {
      try {
        let res = await jwt.verifyAsync(token, config.secret, config.options);
        req.jwt_cache = res;
        return res;
      } catch (e) {
        latestError = e;
      }
    }
    throw latestError;
  } catch (e) {
    throw createError(401, e.message);
  }
};

const isEnabled = async (): Promise<Boolean> => {
  let configs = await getConfigs();
  return configs.length > 0;
};

const getConfigs = async (): Promise<JWTConfig[]> => {
  if (_configsCache) {
    return _configsCache;
  }
  let configs: JWTConfig[] = [];

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
    let res = await fetch(JWT_CERTS_URL);
    let content = await res.json();
    configs = configs.concat(
      content.map(cert => {
        return {
          secret: new Buffer(cert.key, 'base64'),
          options: { algorhitm: 'RS256' }
        };
      })
    );
  }

  _configsCache = configs;
  return configs;
};
