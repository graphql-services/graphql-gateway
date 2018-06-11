import {
  GraphQLSchema,
  getNamedType,
  GraphQLField,
  GraphQLObjectType,
  ResponsePath
} from 'graphql';
import { mergeSchemas } from 'graphql-tools';
import { checkPermissions, getTokenFromRequest } from './jwt';

const GRAPHQL_PERMISSIONS_PATH_PREFIX =
  process.env.GRAPHQL_PERMISSIONS_PATH_PREFIX || null;

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
    if (typeof currentPath.key === 'string') {
      parts.unshift(currentPath.key);
    }
    currentPath = currentPath.prev;
  } while (currentPath);

  return parts.join(':');
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

    let allowed = await checkPermissions(ctx.req, path);
    let typeAllowed = await checkPermissions(ctx.req, typePath);

    if (allowed && typeAllowed) {
      return prev(parent, args, ctx, info);
    }

    if (process.env.DEBUG) {
      const token = await getTokenFromRequest(ctx.req);
      console.log(
        `access denied for ${path} or ${typePath} for ${JSON.stringify(token)}`
      );
    }

    return null;
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
