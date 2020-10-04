"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.PublishServiceSchemaDocument = exports.GetGatewayDocument = exports.GatewayVersionStatus = void 0;
const graphql_tag_1 = require("graphql-tag");
const graphql_1 = require("graphql");
var GatewayVersionStatus;
(function (GatewayVersionStatus) {
    GatewayVersionStatus["Pending"] = "PENDING";
    GatewayVersionStatus["Valid"] = "VALID";
    GatewayVersionStatus["Invalid"] = "INVALID";
})(GatewayVersionStatus = exports.GatewayVersionStatus || (exports.GatewayVersionStatus = {}));
exports.GetGatewayDocument = graphql_tag_1.default `
  query getGateway($id: ID!) {
    gateway(id: $id) {
      id
      name
      currentVersion {
        id
        status
        validationError
        serviceSchemas {
          id
          version
          typeDefs
          service {
            name
            url
          }
        }
      }
      createdAt
    }
  }
`;
exports.PublishServiceSchemaDocument = graphql_tag_1.default `
  mutation publishServiceSchema($input: ServiceSchemaInput!) {
    publishServiceSchema(input: $input) {
      id
      version
      typeDefs
    }
  }
`;
const defaultWrapper = (sdkFunction) => sdkFunction();
function getSdk(client, withWrapper = defaultWrapper) {
    return {
        getGateway(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.GetGatewayDocument), variables));
        },
        publishServiceSchema(variables) {
            return withWrapper(() => client.request(graphql_1.print(exports.PublishServiceSchemaDocument), variables));
        },
    };
}
exports.getSdk = getSdk;
//# sourceMappingURL=graph-manager-sdk.js.map