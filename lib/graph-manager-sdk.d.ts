import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from "graphql";
import { GraphQLClient } from "graphql-request";
export declare type Maybe<T> = T | null;
export declare type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export declare type RequireFields<T, K extends keyof T> = {
    [X in Exclude<keyof T, K>]?: T[X];
} & {
    [P in K]-?: NonNullable<T[P]>;
};
export declare type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    DateTime: any;
};
export declare type Service = {
    __typename?: "Service";
    id: Scalars["ID"];
    createdAt: Scalars["DateTime"];
    name: Scalars["String"];
    url: Scalars["String"];
    schemas: Array<ServiceSchema>;
    latestSchema?: Maybe<ServiceSchema>;
};
export declare type ServiceSchema = {
    __typename?: "ServiceSchema";
    id: Scalars["ID"];
    createdAt: Scalars["DateTime"];
    version: Scalars["String"];
    typeDefs: Scalars["String"];
    service: Service;
    gatewayVersions: Array<GatewayVersion>;
};
export declare type GatewayVersion = {
    __typename?: "GatewayVersion";
    id: Scalars["ID"];
    createdAt: Scalars["DateTime"];
    status: GatewayVersionStatus;
    validationError?: Maybe<Scalars["String"]>;
    gateway: Gateway;
    serviceSchemas: Array<ServiceSchema>;
};
export declare enum GatewayVersionStatus {
    Pending = "PENDING",
    Valid = "VALID",
    Invalid = "INVALID"
}
export declare type Gateway = {
    __typename?: "Gateway";
    id: Scalars["ID"];
    createdAt: Scalars["DateTime"];
    name: Scalars["String"];
    services: Array<Service>;
    versions: Array<GatewayVersion>;
    currentVersion?: Maybe<GatewayVersion>;
};
export declare type Query = {
    __typename?: "Query";
    gateway?: Maybe<Gateway>;
    service?: Maybe<Service>;
};
export declare type QueryGatewayArgs = {
    id: Scalars["ID"];
};
export declare type QueryServiceArgs = {
    id: Scalars["ID"];
};
export declare type Mutation = {
    __typename?: "Mutation";
    createGateway: Gateway;
    deleteGateway: Scalars["Boolean"];
    createService: Service;
    deleteService: Scalars["Boolean"];
    addServiceToGateway: Scalars["Boolean"];
    removeServiceFromGateway: Scalars["Boolean"];
    publishServiceSchema: ServiceSchema;
};
export declare type MutationCreateGatewayArgs = {
    input: GatewayInput;
};
export declare type MutationDeleteGatewayArgs = {
    id: Scalars["ID"];
};
export declare type MutationCreateServiceArgs = {
    input: ServiceInput;
};
export declare type MutationDeleteServiceArgs = {
    id: Scalars["ID"];
};
export declare type MutationAddServiceToGatewayArgs = {
    gatewayId: Scalars["ID"];
    serviceId: Scalars["ID"];
};
export declare type MutationRemoveServiceFromGatewayArgs = {
    gatewayId: Scalars["ID"];
    serviceId: Scalars["ID"];
};
export declare type MutationPublishServiceSchemaArgs = {
    input: ServiceSchemaInput;
};
export declare type GatewayInput = {
    id?: Maybe<Scalars["ID"]>;
    name: Scalars["String"];
};
export declare type ServiceInput = {
    id?: Maybe<Scalars["ID"]>;
    name: Scalars["String"];
    url: Scalars["String"];
};
export declare type ServiceSchemaInput = {
    serviceId: Scalars["ID"];
    version: Scalars["String"];
    typeDefs: Scalars["String"];
};
export declare type Subscription = {
    __typename?: "Subscription";
    gatewayVersionUpdated: GatewayVersion;
};
export declare type SubscriptionGatewayVersionUpdatedArgs = {
    gatewayId: Scalars["ID"];
};
export declare type ResolverTypeWrapper<T> = Promise<T> | T;
export declare type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
    fragment: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export declare type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
    selectionSet: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export declare type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export declare type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | StitchingResolver<TResult, TParent, TContext, TArgs>;
export declare type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;
export declare type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;
export declare type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{
        [key in TKey]: TResult;
    }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, {
        [key in TKey]: TResult;
    }, TContext, TArgs>;
}
export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}
export declare type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> = SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs> | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;
export declare type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> = ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>) | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;
export declare type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (parent: TParent, context: TContext, info: GraphQLResolveInfo) => Maybe<TTypes> | Promise<Maybe<TTypes>>;
export declare type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;
export declare type NextResolverFn<T> = () => Promise<T>;
export declare type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (next: NextResolverFn<TResult>, parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
export declare type ResolversTypes = {
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
export declare type ResolversParentTypes = {
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
export declare type ServiceResolvers<ContextType = any, ParentType extends ResolversParentTypes["Service"] = ResolversParentTypes["Service"]> = {
    id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    url?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    schemas?: Resolver<Array<ResolversTypes["ServiceSchema"]>, ParentType, ContextType>;
    latestSchema?: Resolver<Maybe<ResolversTypes["ServiceSchema"]>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
    name: "DateTime";
}
export declare type ServiceSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes["ServiceSchema"] = ResolversParentTypes["ServiceSchema"]> = {
    id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    version?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    typeDefs?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    service?: Resolver<ResolversTypes["Service"], ParentType, ContextType>;
    gatewayVersions?: Resolver<Array<ResolversTypes["GatewayVersion"]>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type GatewayVersionResolvers<ContextType = any, ParentType extends ResolversParentTypes["GatewayVersion"] = ResolversParentTypes["GatewayVersion"]> = {
    id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    status?: Resolver<ResolversTypes["GatewayVersionStatus"], ParentType, ContextType>;
    validationError?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    gateway?: Resolver<ResolversTypes["Gateway"], ParentType, ContextType>;
    serviceSchemas?: Resolver<Array<ResolversTypes["ServiceSchema"]>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type GatewayResolvers<ContextType = any, ParentType extends ResolversParentTypes["Gateway"] = ResolversParentTypes["Gateway"]> = {
    id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    services?: Resolver<Array<ResolversTypes["Service"]>, ParentType, ContextType>;
    versions?: Resolver<Array<ResolversTypes["GatewayVersion"]>, ParentType, ContextType>;
    currentVersion?: Resolver<Maybe<ResolversTypes["GatewayVersion"]>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export declare type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]> = {
    gateway?: Resolver<Maybe<ResolversTypes["Gateway"]>, ParentType, ContextType, RequireFields<QueryGatewayArgs, "id">>;
    service?: Resolver<Maybe<ResolversTypes["Service"]>, ParentType, ContextType, RequireFields<QueryServiceArgs, "id">>;
};
export declare type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]> = {
    createGateway?: Resolver<ResolversTypes["Gateway"], ParentType, ContextType, RequireFields<MutationCreateGatewayArgs, "input">>;
    deleteGateway?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType, RequireFields<MutationDeleteGatewayArgs, "id">>;
    createService?: Resolver<ResolversTypes["Service"], ParentType, ContextType, RequireFields<MutationCreateServiceArgs, "input">>;
    deleteService?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType, RequireFields<MutationDeleteServiceArgs, "id">>;
    addServiceToGateway?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType, RequireFields<MutationAddServiceToGatewayArgs, "gatewayId" | "serviceId">>;
    removeServiceFromGateway?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType, RequireFields<MutationRemoveServiceFromGatewayArgs, "gatewayId" | "serviceId">>;
    publishServiceSchema?: Resolver<ResolversTypes["ServiceSchema"], ParentType, ContextType, RequireFields<MutationPublishServiceSchemaArgs, "input">>;
};
export declare type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"]> = {
    gatewayVersionUpdated?: SubscriptionResolver<ResolversTypes["GatewayVersion"], "gatewayVersionUpdated", ParentType, ContextType, RequireFields<SubscriptionGatewayVersionUpdatedArgs, "gatewayId">>;
};
export declare type Resolvers<ContextType = any> = {
    Service?: ServiceResolvers<ContextType>;
    DateTime?: GraphQLScalarType;
    ServiceSchema?: ServiceSchemaResolvers<ContextType>;
    GatewayVersion?: GatewayVersionResolvers<ContextType>;
    Gateway?: GatewayResolvers<ContextType>;
    Query?: QueryResolvers<ContextType>;
    Mutation?: MutationResolvers<ContextType>;
    Subscription?: SubscriptionResolvers<ContextType>;
};
export declare type IResolvers<ContextType = any> = Resolvers<ContextType>;
export declare type GetGatewayQueryVariables = Exact<{
    id: Scalars["ID"];
}>;
export declare type GetGatewayQuery = {
    __typename?: "Query";
} & {
    gateway?: Maybe<{
        __typename?: "Gateway";
    } & Pick<Gateway, "id" | "name" | "createdAt"> & {
        currentVersion?: Maybe<{
            __typename?: "GatewayVersion";
        } & Pick<GatewayVersion, "id" | "status" | "validationError"> & {
            serviceSchemas: Array<{
                __typename?: "ServiceSchema";
            } & Pick<ServiceSchema, "id" | "version" | "typeDefs"> & {
                service: {
                    __typename?: "Service";
                } & Pick<Service, "name" | "url">;
            }>;
        }>;
    }>;
};
export declare type PublishServiceSchemaMutationVariables = Exact<{
    input: ServiceSchemaInput;
}>;
export declare type PublishServiceSchemaMutation = {
    __typename?: "Mutation";
} & {
    publishServiceSchema: {
        __typename?: "ServiceSchema";
    } & Pick<ServiceSchema, "id" | "version" | "typeDefs">;
};
export declare type OnGatewayVersionUpdatedSubscriptionVariables = Exact<{
    gatewayId: Scalars["ID"];
}>;
export declare type OnGatewayVersionUpdatedSubscription = {
    __typename?: "Subscription";
} & {
    gatewayVersionUpdated: {
        __typename?: "GatewayVersion";
    } & Pick<GatewayVersion, "id" | "status"> & {
        gateway: {
            __typename?: "Gateway";
        } & Pick<Gateway, "id" | "name"> & {
            currentVersion?: Maybe<{
                __typename?: "GatewayVersion";
            } & {
                serviceSchemas: Array<{
                    __typename?: "ServiceSchema";
                } & Pick<ServiceSchema, "version" | "typeDefs"> & {
                    service: {
                        __typename?: "Service";
                    } & Pick<Service, "name" | "url">;
                }>;
            }>;
        };
    };
};
export declare const GetGatewayDocument: any;
export declare const PublishServiceSchemaDocument: any;
export declare const OnGatewayVersionUpdatedDocument: any;
export declare type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;
export declare function getSdk(client: GraphQLClient, withWrapper?: SdkFunctionWrapper): {
    getGateway(variables: GetGatewayQueryVariables): Promise<GetGatewayQuery>;
    publishServiceSchema(variables: PublishServiceSchemaMutationVariables): Promise<PublishServiceSchemaMutation>;
    onGatewayVersionUpdated(variables: OnGatewayVersionUpdatedSubscriptionVariables): Promise<OnGatewayVersionUpdatedSubscription>;
};
export declare type Sdk = ReturnType<typeof getSdk>;
