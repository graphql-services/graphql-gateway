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

import { getENV } from './env';

const JWT_SECRET = getENV('GRAPHQL_JWT_SECRET', null);
const JWT_PUBLIC_CERT = getENV('GRAPHQL_JWT_PUBLIC_CERT', null);
const JWT_CERTS_URL = getENV('GRAPHQL_JWT_CERTS_URL', null);

interface JWTConfig {
  secret: string;
  options: { [key: string]: any };
}

let _configsCache: JWTConfig[] | null = null;

export const checkPermissionsAndAttributes = async (
  tokenInfo,
  resource: string
): Promise<{ allowed: boolean; attributes?: { [key: string]: any } }> => {
  if (!(await isEnabled())) {
    return { allowed: true };
  }

  const userInfo = tokenInfo.user || tokenInfo;

  let permissions = userInfo.permissions;
  if (!permissions) {
    return { allowed: false };
  }
  permissions = render(permissions, { token: tokenInfo });

  return {
    allowed: checkACLPermissions(permissions, resource),
    attributes: getAttributes(permissions, resource)
  };
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
