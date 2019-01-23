const createError = require('http-errors');
import * as bluebird from 'bluebird';
import fetch from 'node-fetch';
const jwt = bluebird.promisifyAll(require('jsonwebtoken'));
import {
  checkPermissions as checkACLPermissions,
  getAttributes,
  getDenialRule,
  PermissionRule
} from 'acl-permissions';
import { render } from 'mustache';
import { ExpirationStrategy, MemoryStorage } from 'node-ts-cache';

const tokenInfoCache = new ExpirationStrategy(new MemoryStorage());
const permissionCache = new ExpirationStrategy(new MemoryStorage());

import { getENV } from './env';
import { log } from './logger';

const JWT_SECRET = getENV('GRAPHQL_JWT_SECRET', null);
const JWT_PUBLIC_CERT = getENV('GRAPHQL_JWT_PUBLIC_CERT', null);
const JWT_CERTS_URL = getENV('GRAPHQL_JWT_CERTS_URL', null);

interface JWTConfig {
  secret: string;
  options: { [key: string]: any };
}

let _configsCache: JWTConfig[] | null = null;

export type CheckPermissionsResult = {
  allowed: boolean;
  resource: string;
  attributes?: { [key: string]: any };
};
export const checkPermissionsAndAttributes = async (
  tokenInfo,
  resource: string
): Promise<CheckPermissionsResult> => {
  if (!(await isEnabled())) {
    return { resource, allowed: true };
  }

  const cacheKey = `${tokenInfo._token}__${resource}`;

  const cacheResult = await permissionCache.getItem(cacheKey);
  if (cacheResult) {
    return cacheResult as CheckPermissionsResult;
  }

  log(`checking permissions and attributes for resource ${resource}`);

  const userInfo = tokenInfo.user || tokenInfo;

  let permissions = userInfo.permissions;
  if (!permissions) {
    return { resource, allowed: false };
  }
  permissions = render(permissions, { token: tokenInfo });

  const res = {
    resource,
    allowed: checkACLPermissions(permissions, resource),
    attributes: getAttributes(permissions, resource)
  };
  await permissionCache.setItem(cacheKey, res, { ttl: 300 });

  log(`checked permissions and attributes for resource ${resource}`);

  return res;
};

export const getDenialForRequest = (
  tokenInfo,
  resource: string
): PermissionRule | null => {
  const userInfo = tokenInfo.user || tokenInfo;

  let permissions = userInfo.permissions;
  if (!permissions) {
    return null;
  }
  return getDenialRule(permissions, resource);
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
  const res = await extractInfoFromToken(token);
  res._token = token;
  req.jwt_cache = res;
  return res;
};

const extractInfoFromToken = async (token: string) => {
  const cacheRes = await tokenInfoCache.getItem(token);
  if (cacheRes) {
    return cacheRes;
  }
  try {
    log(`extracting information from access token`);

    let configs = await getConfigs();

    let latestError = null;
    for (let config of configs) {
      try {
        let res = await jwt.verifyAsync(token, config.secret, config.options);
        await tokenInfoCache.setItem(token, res, { ttl: 300 });
        log(`extracted information from access token`);
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

  log(`collecting JWT configuration`);

  let configs: JWTConfig[] = [];

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
    log(`fetching certificates from ${JWT_CERTS_URL}`);

    let res = await fetch(JWT_CERTS_URL);
    let content = await res.json();

    log(`fetched certificates from ${JWT_CERTS_URL}`);
    configs = configs.concat(
      content.map(cert => {
        return {
          secret: new Buffer(cert.key, 'base64'),
          options: { algorhitm: 'RS256' }
        };
      })
    );
  }

  log(`JWT config collected ${JSON.stringify(configs)}`);

  _configsCache = configs;
  return configs;
};
