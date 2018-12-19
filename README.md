# graphql-gateway

Simple but extendable GraphQL gateway. Suited for containerized deployments with following features:

- [x] Schema merging
- [x] JWT token validation
- [x] ACL permissions on field level
- [ ] Prometheus metrics endpoint
- [x] Apollo Engine tracing integration

## Docker

You can start docker container directly:

```
docker run --rm -p 8080:80 -e GRAPHQL_URL_0=https://api.graphloc.com/graphql graphql/gateway
```

Or using docker-compose:

```
version: '2'
services:
  graphql-gateway:
    image: graphql/gateway
    links:
      - my-custom-service
    ports:
      - 8080:80
    environment:
      - GRAPHQL_URL_0=https://graphql-demo.azurewebsites.net/
      - GRAPHQL_URL_1=https://api.graphloc.com/graphql
      - GRAPHQL_URL_2=http://my-custom-service/graphql
 my-custom-service:
   image: ...
```

## Schema merging

You can merge multiple schemas into one by prividing `GRAPHQL_URL_N` variables. For example

```
GRAPHQL_URL_0=https://graphql-demo.azurewebsites.net/
GRAPHQL_URL_1=https://api.graphloc.com/graphql
```

will start gateway with two merged schemas.

Gateway support headers forwarding to merged APIs, by default it forwards `authorization` headers, but you can specify list of your own by provising environment variable:

```
GRAPHQL_FORWARD_HEADERS=authorization,custom-header1,... (comma separated list,default: authorization)
```

## JWT token validation

Gateway can accept `Authorization: Bearer ...` header with JWT token and verify it using secret or public certificate. Configuration is using following environment varialbes:

- `GRAPHQL_JWT_SECRET` - verify using secret string
- `GRAPHQL_JWT_PUBLIC_CERT` - verify using public certificate (string)
- `GRAPHQL_JWT_CERTS_URL` - specify url where public certificates could be downloaded (array of `{key: string}` is expected)

You can provide all of these options and if one of it pass, the token is considered valid.

## ACL permissions on field level

This feature is disabled by default. You can enabled it by specifying env. variable:
`GRAPHQL_JWT_PERMISSIONS_ENABLED=1`

You can manage access control for each type/field by prividing string under key `permissions` or `user.permissions` in JWT payload object. The string should contain ACL rules in following format (each rule has to be on new line):

```
{type}|{path_to_resource}
```

- `type` - `allow`, `deny` if no allow rule matches access is denied
- `resource` - path to type/field separated by `:`. You can also use `*` to match any following fields.

If access to specific field matches as denial `null` value is returned.

For example for following schema:

```
type Post {
    id: ID!
    title: String
}

type Query {
    posts: [Post!]
    post(id: ID): Post
}

type Mutation {
    createPost(title: String): Post
    updatePost(id: ID!, title: String): Post
    deletePost(id: ID!): Post
}
```

...you can use following resource paths:

```
posts
Query:posts
post
Query:post
createPost
Mutation:createPost
updatePost
Mutation:updatePost
deletePost
Mutation:deletePost
Post:id
Post:title
```

so for example you can:

```
# readonly access
allow|Query:*

# readonly access for posts and post detail only
allow|posts:*
allow|post:*
# this can be also specified by allow|Query:post*, but this will also match Query.postSomething

# allow access to any query except User.secretField `{ query { users { id username secretField} } }`
allow|*
deny|User:secretField
```

Named queries/mutations:

```

# for following query
# query myBlahQuery { users { id username } }

allow|myBlahQuery:*
allow|myBlahQuery:users
```

### Global ACL resource prefix

You can also enforce prefix for all resources by specifying `PERMISSIONS_PATH_PREFIX=...` in environment variables.

For example for:

```
PERMISSIONS_PATH_PREFIX=myApp
```

resources has to match:

```
myApp:Query:posts
myApp:posts:*
myApp:Mutation:createPost
...
```

### Apollo engine support

If you provide environment variable:

```
APOLLO_ENGINE_KEY=...
```

The gateway automatically starts with Engine proxy.
