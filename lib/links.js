"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = require("graphql-tools");
const graphql_1 = require("graphql");
const fs_1 = require("fs");
const glob_1 = require("glob");
const loadTypes = (pattern) => {
    const paths = glob_1.sync(pattern).filter(x => x.indexOf('node_modules') === -1);
    return paths.map(path => fs_1.readFileSync(path, 'utf8'));
};
let links = `
  directive @link(fetchField: String!,reference: String!) on FIELD_DEFINITION
` + loadTypes('./**/links.graphql').join('\n');
exports.applyLinksToSchema = (schema) => {
    graphql_1.buildSchema(graphql_1.printSchema(schema) + links);
    const linksDocument = graphql_1.parse(links);
    let linkMapping = [];
    for (let definition of linksDocument.definitions) {
        if (definition.kind === 'ObjectTypeExtension') {
            for (let field of definition.fields || []) {
                if (field.kind === 'FieldDefinition') {
                    for (let directive of field.directives || []) {
                        if (directive.name.value === 'link') {
                            let item = {
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
    let typeDefs = graphql_1.print(linksDocument);
    let resolvers = {};
    for (let item of linkMapping) {
        resolvers[item.type] = resolvers[item.type] || {};
        resolvers[item.type][item.field] = {
            fragment: `... on ${item.type} { ${item.reference} }`,
            resolve(parent, args, context, info) {
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
    return graphql_tools_1.mergeSchemas({ schemas: [schema, typeDefs], resolvers });
};
//# sourceMappingURL=links.js.map