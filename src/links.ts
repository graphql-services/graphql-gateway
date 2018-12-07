import { MergeInfo, mergeSchemas, SchemaDirectiveVisitor } from 'graphql-tools';
import {
  GraphQLSchema,
  GraphQLResolveInfo,
  buildSchema,
  printSchema,
  parse,
  print
} from 'graphql';
import { readFileSync } from 'fs';
import { sync as globSync } from 'glob';
import { log } from './logger';

const loadTypes = (pattern: string): string[] => {
  const paths = globSync(pattern).filter(x => x.indexOf('node_modules') === -1);
  return paths.map(path => readFileSync(path, 'utf8'));
};

let links =
  `
  directive @link(fetchField: String!,reference: String!) on FIELD_DEFINITION
` + loadTypes('./**/links.graphql').join('\n');

interface LinkMapItem {
  type: string;
  field: string;
  fetchField: string;
  reference: string;
}

export const applyLinksToSchema = (schema: GraphQLSchema): GraphQLSchema => {
  // validate if schema with links is buildable
  buildSchema(printSchema(schema) + links);
  const linksDocument = parse(links);

  let linkMapping: LinkMapItem[] = [];

  for (let definition of linksDocument.definitions) {
    if (definition.kind === 'ObjectTypeExtension') {
      for (let field of definition.fields || []) {
        if (field.kind === 'FieldDefinition') {
          for (let directive of field.directives || []) {
            if (directive.name.value === 'link') {
              let item: LinkMapItem = {
                type: definition.name.value,
                field: field.name.value,
                fetchField: '',
                reference: ''
              };
              for (let arg of directive.arguments || []) {
                if (arg.value.kind !== 'StringValue') {
                  continue;
                }
                switch (arg.name.value) {
                  case 'fetchField':
                    item.fetchField = arg.value.value;
                    break;
                  case 'reference':
                    item.reference = arg.value.value;
                    break;
                }
              }
              linkMapping.push(item);
            }
          }
          field.directives = [];
        }
      }
    }
  }

  let typeDefs = print(linksDocument);
  let resolvers = {};

  for (let item of linkMapping) {
    resolvers[item.type] = resolvers[item.type] || {};
    resolvers[item.type][item.field] = {
      fragment: `... on ${item.type} { ${item.reference} }`,
      resolve(
        parent,
        args,
        context,
        info: GraphQLResolveInfo & {
          mergeInfo: MergeInfo;
        }
      ) {
        const from = parent[item.reference];
        if (from === null || typeof from === 'undefined') {
          return null;
        }

        return info.mergeInfo.delegateToSchema({
          schema,
          operation: 'query',
          fieldName: item.fetchField,
          args: { id: from },
          info,
          context
        });
      }
    };
  }

  return mergeSchemas({ schemas: [schema, typeDefs], resolvers });
};
