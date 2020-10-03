import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";

import { GraphQLClient } from "graphql-request";
import gql from "graphql-tag";
import { print } from "graphql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
};

export type Service = {
  __typename?: "Service";
  id: Scalars["ID"];
  createdAt: Scalars["DateTime"];
  name: Scalars["String"];
  url: Scalars["String"];
  schemas: Array<ServiceSchema>;
  latestSchema?: Maybe<ServiceSchema>;
};

export type ServiceSchema = {
  __typename?: "ServiceSchema";
  id: Scalars["ID"];
  createdAt: Scalars["DateTime"];
  version: Scalars["String"];
  typeDefs: Scalars["String"];
  service: Service;
  gatewayVersions: Array<GatewayVersion>;
};

export type GatewayVersion = {
  __typename?: "GatewayVersion";
  id: Scalars["ID"];
  createdAt: Scalars["DateTime"];
  status: GatewayVersionStatus;
  validationError?: Maybe<Scalars["String"]>;
  gateway: Gateway;
  serviceSchemas: Array<ServiceSchema>;
};

export enum GatewayVersionStatus {
  Pending = "PENDING",
  Valid = "VALID",
  Invalid = "INVALID",
}

export type Gateway = {
  __typename?: "Gateway";
  id: Scalars["ID"];
  createdAt: Scalars["DateTime"];
  name: Scalars["String"];
  services: Array<Service>;
  versions: Array<GatewayVersion>;
  currentVersion?: Maybe<GatewayVersion>;
};

export type Query = {
  __typename?: "Query";
  gateway?: Maybe<Gateway>;
  service?: Maybe<Service>;
};

export type QueryGatewayArgs = {
  id: Scalars["ID"];
};

export type QueryServiceArgs = {
  id: Scalars["ID"];
};

export type Mutation = {
  __typename?: "Mutation";
  createGateway: Gateway;
  deleteGateway: Scalars["Boolean"];
  createService: Service;
  deleteService: Scalars["Boolean"];
  addServiceToGateway: Scalars["Boolean"];
  removeServiceFromGateway: Scalars["Boolean"];
  publishServiceSchema: ServiceSchema;
};

export type MutationCreateGatewayArgs = {
  input: GatewayInput;
};

export type MutationDeleteGatewayArgs = {
  id: Scalars["ID"];
};

export type MutationCreateServiceArgs = {
  input: ServiceInput;
};

export type MutationDeleteServiceArgs = {
  id: Scalars["ID"];
};

export type MutationAddServiceToGatewayArgs = {
  gatewayId: Scalars["ID"];
  serviceId: Scalars["ID"];
};

export type MutationRemoveServiceFromGatewayArgs = {
  gatewayId: Scalars["ID"];
  serviceId: Scalars["ID"];
};

export type MutationPublishServiceSchemaArgs = {
  input: ServiceSchemaInput;
};

export type GatewayInput = {
  id?: Maybe<Scalars["ID"]>;
  name: Scalars["String"];
};

export type ServiceInput = {
  id?: Maybe<Scalars["ID"]>;
  name: Scalars["String"];
  url: Scalars["String"];
};

export type ServiceSchemaInput = {
  serviceId: Scalars["ID"];
  version: Scalars["String"];
  typeDefs: Scalars["String"];
};

export type Subscription = {
  __typename?: "Subscription";
  gatewayVersionUpdated: GatewayVersion;
};

export type SubscriptionGatewayVersionUpdatedArgs = {
  gatewayId: Scalars["ID"];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  String: ResolverTypeWrapper<Scalars["String"]>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  Service: ResolverTypeWrapper<Service>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  DateTime: ResolverTypeWrapper<Scalars["DateTime"]>;
  ServiceSchema: ResolverTypeWrapper<ServiceSchema>;
  GatewayVersion: ResolverTypeWrapper<GatewayVersion>;
  GatewayVersionStatus: GatewayVersionStatus;
  Gateway: ResolverTypeWrapper<Gateway>;
  Query: ResolverTypeWrapper<{}>;
  Mutation: ResolverTypeWrapper<{}>;
  GatewayInput: GatewayInput;
  ServiceInput: ServiceInput;
  ServiceSchemaInput: ServiceSchemaInput;
  Subscription: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  String: Scalars["String"];
  Boolean: Scalars["Boolean"];
  Service: Service;
  ID: Scalars["ID"];
  DateTime: Scalars["DateTime"];
  ServiceSchema: ServiceSchema;
  GatewayVersion: GatewayVersion;
  Gateway: Gateway;
  Query: {};
  Mutation: {};
  GatewayInput: GatewayInput;
  ServiceInput: ServiceInput;
  ServiceSchemaInput: ServiceSchemaInput;
  Subscription: {};
};

export type ServiceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Service"] = ResolversParentTypes["Service"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  schemas?: Resolver<
    Array<ResolversTypes["ServiceSchema"]>,
    ParentType,
    ContextType
  >;
  latestSchema?: Resolver<
    Maybe<ResolversTypes["ServiceSchema"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export type ServiceSchemaResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ServiceSchema"] = ResolversParentTypes["ServiceSchema"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  version?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  typeDefs?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  service?: Resolver<ResolversTypes["Service"], ParentType, ContextType>;
  gatewayVersions?: Resolver<
    Array<ResolversTypes["GatewayVersion"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GatewayVersionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["GatewayVersion"] = ResolversParentTypes["GatewayVersion"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  status?: Resolver<
    ResolversTypes["GatewayVersionStatus"],
    ParentType,
    ContextType
  >;
  validationError?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  gateway?: Resolver<ResolversTypes["Gateway"], ParentType, ContextType>;
  serviceSchemas?: Resolver<
    Array<ResolversTypes["ServiceSchema"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GatewayResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Gateway"] = ResolversParentTypes["Gateway"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  services?: Resolver<
    Array<ResolversTypes["Service"]>,
    ParentType,
    ContextType
  >;
  versions?: Resolver<
    Array<ResolversTypes["GatewayVersion"]>,
    ParentType,
    ContextType
  >;
  currentVersion?: Resolver<
    Maybe<ResolversTypes["GatewayVersion"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = {
  gateway?: Resolver<
    Maybe<ResolversTypes["Gateway"]>,
    ParentType,
    ContextType,
    RequireFields<QueryGatewayArgs, "id">
  >;
  service?: Resolver<
    Maybe<ResolversTypes["Service"]>,
    ParentType,
    ContextType,
    RequireFields<QueryServiceArgs, "id">
  >;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = {
  createGateway?: Resolver<
    ResolversTypes["Gateway"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateGatewayArgs, "input">
  >;
  deleteGateway?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteGatewayArgs, "id">
  >;
  createService?: Resolver<
    ResolversTypes["Service"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateServiceArgs, "input">
  >;
  deleteService?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteServiceArgs, "id">
  >;
  addServiceToGateway?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationAddServiceToGatewayArgs, "gatewayId" | "serviceId">
  >;
  removeServiceFromGateway?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<
      MutationRemoveServiceFromGatewayArgs,
      "gatewayId" | "serviceId"
    >
  >;
  publishServiceSchema?: Resolver<
    ResolversTypes["ServiceSchema"],
    ParentType,
    ContextType,
    RequireFields<MutationPublishServiceSchemaArgs, "input">
  >;
};

export type SubscriptionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"]
> = {
  gatewayVersionUpdated?: SubscriptionResolver<
    ResolversTypes["GatewayVersion"],
    "gatewayVersionUpdated",
    ParentType,
    ContextType,
    RequireFields<SubscriptionGatewayVersionUpdatedArgs, "gatewayId">
  >;
};

export type Resolvers<ContextType = any> = {
  Service?: ServiceResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  ServiceSchema?: ServiceSchemaResolvers<ContextType>;
  GatewayVersion?: GatewayVersionResolvers<ContextType>;
  Gateway?: GatewayResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;

export type GetGatewayQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetGatewayQuery = { __typename?: "Query" } & {
  gateway?: Maybe<
    { __typename?: "Gateway" } & Pick<Gateway, "id" | "name" | "createdAt"> & {
        currentVersion?: Maybe<
          { __typename?: "GatewayVersion" } & Pick<
            GatewayVersion,
            "id" | "status" | "validationError"
          > & {
              serviceSchemas: Array<
                { __typename?: "ServiceSchema" } & Pick<
                  ServiceSchema,
                  "id" | "version" | "typeDefs"
                > & {
                    service: { __typename?: "Service" } & Pick<
                      Service,
                      "name" | "url"
                    >;
                  }
              >;
            }
        >;
      }
  >;
};

export type PublishServiceSchemaMutationVariables = Exact<{
  input: ServiceSchemaInput;
}>;

export type PublishServiceSchemaMutation = { __typename?: "Mutation" } & {
  publishServiceSchema: { __typename?: "ServiceSchema" } & Pick<
    ServiceSchema,
    "id" | "version" | "typeDefs"
  >;
};

export const GetGatewayDocument = gql`
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
export const PublishServiceSchemaDocument = gql`
  mutation publishServiceSchema($input: ServiceSchemaInput!) {
    publishServiceSchema(input: $input) {
      id
      version
      typeDefs
    }
  }
`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (sdkFunction) => sdkFunction();
export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    getGateway(variables: GetGatewayQueryVariables): Promise<GetGatewayQuery> {
      return withWrapper(() =>
        client.request<GetGatewayQuery>(print(GetGatewayDocument), variables)
      );
    },
    publishServiceSchema(
      variables: PublishServiceSchemaMutationVariables
    ): Promise<PublishServiceSchemaMutation> {
      return withWrapper(() =>
        client.request<PublishServiceSchemaMutation>(
          print(PublishServiceSchemaDocument),
          variables
        )
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
