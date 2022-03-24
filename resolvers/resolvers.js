const { PubSub } = require("graphql-subscriptions");
const { execute, subscribe } = require("graphql");

const pubsub = new PubSub();

const resolvers = {
    Query: {
        currentNumber() {
          return currentNumber;
        },
    },
    Subscription: {
        numberIncremented: {
          subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
        },
    },
};
  

module.exports = resolvers