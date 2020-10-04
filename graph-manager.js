const { execute } = require("apollo-link");
const { WebSocketLink } = require("apollo-link-ws");
const { SubscriptionClient } = require("subscriptions-transport-ws");
const ws = require("ws");

const getWsClient = function (wsurl) {
  const client = new SubscriptionClient(wsurl, { reconnect: true }, ws);
  return client;
};

const createSubscriptionObservable = (wsurl, query, variables) => {
  const link = new WebSocketLink(getWsClient(wsurl));
  return execute(link, { query: query, variables: variables });
};
module.exports.createSubscriptionObservable = createSubscriptionObservable;
