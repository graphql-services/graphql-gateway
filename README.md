# graphql-gateway

Apollo federation gateway wrapped in Docker image or AWS Lambda package.

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

## Merging GraphQL API's running in AWS Lambda

Gateway can also call AWS Lambda functions directly, just provide url in this format:

```
GRAPHQL_URL_0=lambda://my-function-name/graphql[?version=my-version]
// specific version
GRAPHQL_URL_0=lambda://my-function-name/graphql?version=my-version
```

### Apollo engine support

If you provide environment variable:

```
APOLLO_ENGINE_KEY=...
```

The gateway automatically starts with Engine proxy.
