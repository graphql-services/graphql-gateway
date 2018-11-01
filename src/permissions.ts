import {
  GraphQLSchema,
  getNamedType,
  GraphQLField,
  GraphQLObjectType,
  ResponsePath
} from 'graphql';
const merge = require('deepmerge'); // https://github.com/KyleAMathews/deepmerge/pull/124

import { checkPermissionsAndAttributes, getTokenFromRequest } from './jwt';
import { getENV } from './env';

const GRAPHQL_PERMISSIONS_PATH_PREFIX = getENV(
  'GRAPHQL_PERMISSIONS_PATH_PREFIX',
  null
);

type FieldIteratorFn = (
  fieldDef: GraphQLField<any, any>,
  typeName: string,
  fieldName: string
) => void;

const forEachField = (schema: GraphQLSchema, fn: FieldIteratorFn): void => {
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach(typeName => {
    const type = typeMap[typeName];
    if (
      !getNamedType(type).name.startsWith('__') &&
      type instanceof GraphQLObjectType
    ) {
      const fields = type.getFields();
      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        fn(field, typeName, fieldName);
      });
    }
  });
};

const getFullPath = (path: ResponsePath): string => {
  let parts: string[] = [];

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

const getFirstDifferentPath = (
  object1: { [key: string]: any },
  object2: { [key: string]: any },
  parentPath: string | null = null
): { path: string; value1: any; value2: any } | undefined => {
  for (let key of Object.keys(object1)) {
    let value1 = object1[key];
    let value2 = object2[key];
    let path = parentPath ? parentPath + '.' + key : key;
    if (typeof value1 !== 'undefined' && typeof value2 !== 'undefined') {
      if (typeof value1 === 'object') {
        return getFirstDifferentPath(value1, value2, path);
      } else if (value1 !== value2) {
        return { value1, value2, path };
      }
    }
  }
  return undefined;
};

const fieldResolver = (prev, typeName, fieldName) => {
  return async (parent, args, ctx, info) => {
    let path = getFullPath(info.path);
    let typePath = `${typeName}:${fieldName}`;

    let pathPrefix = GRAPHQL_PERMISSIONS_PATH_PREFIX;
    if (pathPrefix) {
      path = pathPrefix + ':' + path;
      typePath = pathPrefix + ':' + typePath;
    }

    let tokenInfo = await getTokenFromRequest(ctx.req);

    let jwtInfo = await checkPermissionsAndAttributes(tokenInfo, path);
    let jwtTypeInfo = await checkPermissionsAndAttributes(tokenInfo, typePath);

    if (!jwtInfo.allowed && !jwtTypeInfo.allowed) {
      const token = tokenInfo;
      throw new Error(
        `access denied for '${path}' or '${typePath}' for ${JSON.stringify(
          token
        )}`
      );
    }

    const newArgs = merge(
      (jwtInfo && jwtInfo.attributes) || {},
      (jwtTypeInfo && jwtTypeInfo.attributes) || {}
    );

    const diff = getFirstDifferentPath(args, newArgs);
    if (diff) {
      throw new Error(
        `cannot fetch attribute '${diff.path}' with value ${JSON.stringify(
          diff.value1
        )} (expected: ${JSON.stringify(diff.value2)})`
      );
    }

    return prev(parent, args, ctx, info);
  };
};

export const addPermissionsToSchema = (schema: GraphQLSchema) => {
  forEachField(schema, (field, typeName, fieldName) => {
    if (field.resolve) {
      const prev = field.resolve;
      field.resolve = fieldResolver(prev, typeName, fieldName);
    }
  });
};
