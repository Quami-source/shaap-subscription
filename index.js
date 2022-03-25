const { ApolloServer} = require('apollo-server-express');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PubSub, withFilter } = require("graphql-subscriptions");
const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Posts = require('./schema/Posts')
const typeDefs = require('./schema/schema');
const Comment = require('./schema/Comments')
const Recommendations = require('./schema/Recommendations')
const {Expo} = require('expo-server-sdk')
//const resolvers = require('./resolvers/resolvers');

dotenv.config();

let messages = [];

(async function () {
  
    const app = express();
    const pubsub = new PubSub();
    const httpServer = createServer(app);

    mongoose.connect(
      process.env.DB_STRING,
      {useNewUrlParser:true},
      ()=>console.log("Connected to db")
    )

    const resolvers = {
        Query: {
          currentNumber() {
            return currentNumber;
          },
          async posts(){
            const forums = await Posts.find()
            if(forums){
              //console.log(forums)
              return forums
            }
            return 'Error getting posts'
          }
        },
        Mutation:{
          async addPost(parent,args,context,info){
            const {eventLocation,postBody,postedBy} = args

            //publish the event
            pubsub.publish('POST_CREATED', {postCreated:args});

            //create new page for db
            const newPost = new Posts({
              eventLocation,
              postBody,
              postedBy
            })
            try{
              const res = await newPost.save()
              if(res){
                return res;
              }
            }catch(e){
              return e
            }
          },
          async addComment(parent,args,context,info){
            const {commentTo,postComment,commentedBy} = args

            //subscribe to new comments
            pubsub.publish('COMMENT_ADDED',{commentAdded:args})

            const newComment = new Comment({
              commentTo,postComment,commentedBy
            })
            newComment.save((err,res)=>{
              if(err){
                return {
                  "operation":'Save comment',
                  "message":err,
                  "success":false
                }
              }
              else if(res){
                Posts.updateOne({_id:commentTo},{$push:{comments:res._id}},(e,success)=>{
                  if(e){
                    return {
                      "operation":'Update post with new comment id',
                      "message":e,
                      "success":false
                    }
                  }
                  return toString(success)
                })
              }
            })
          },
          async addRecommendation(parent,args,context,info){
            const {postId,recommend,recommendedBy} = args
            const newRecommendation = new Recommendations({
              postId,recommend,recommendedBy
            })
            newRecommendation.save((err,res)=>{
              if(err){
                return {
                  "operation":'Save Recommendation',
                  "message":err,
                  "success":false
                }
              }else{
                Posts.updateOne({_id:postId},{$push:{recommends:res._id}},(e,success)=>{
                  if(e){
                    return {
                      "operation":'Update post with new recommendation id',
                      "message":e,
                      "success":false
                    }
                  }
                  return toString(success)
                })
              }
            })
          }
        },
        Subscription: {
          // numberIncremented: {
          //   subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
          // },                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
          postCreated:{
            subscribe: () => pubsub.asyncIterator(['POST_CREATED'])
          },
          commentAdded:{
            subscribe: withFilter(
              () => pubsub.asyncIterator('COMMENT_ADDED'),
              (payload,variables) => {
                //payload is the item published
                //variables are the items in the paremeter by the client
                //when calling commentAdded
                if(payload.commentAdded.commentTo === variables.commentId){
                  //send notification to particular user
                  for (let pushToken of somePushTokens) {
                    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
                  
                    // Check that all your push tokens appear to be valid Expo push tokens
                    if (!Expo.isExpoPushToken(pushToken)) {
                      console.error(`Push token ${pushToken} is not a valid Expo push token`);
                      continue;
                    }
                  
                    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
                    messages.push({
                      to: "ExponentPushToken[oqVQ3KPO5599iDHxpmfasa]",
                      sound: 'default',
                      body: 'This is a test notification',
                      data: { withSome: 'data' },
                    })
                  }

                  let chunks = expo.chunkPushNotifications(messages);
                  let tickets = [];
                  (async () => {
                    // Send the chunks to the Expo push notification service. There are
                    // different strategies you could use. A simple one is to send one chunk at a
                    // time, which nicely spreads the load out over time:
                    for (let chunk of chunks) {
                      try {
                        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        console.log(ticketChunk);
                        tickets.push(...ticketChunk);
                        // NOTE: If a ticket contains an error code in ticket.details.error, you
                        // must handle it appropriately. The error codes are listed in the Expo
                        // documentation:
                        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                      } catch (error) {
                        console.error(error);
                      }
                    }
                  })();



                  // Later, after the Expo push notification service has delivered the
                  // notifications to Apple or Google (usually quickly, but allow the the service
                  // up to 30 minutes when under load), a "receipt" for each notification is
                  // created. The receipts will be available for at least a day; stale receipts
                  // are deleted.
                  //
                  // The ID of each receipt is sent back in the response "ticket" for each
                  // notification. In summary, sending a notification produces a ticket, which
                  // contains a receipt ID you later use to get the receipt.
                  //
                  // The receipts may contain error codes to which you must respond. In
                  // particular, Apple or Google may block apps that continue to send
                  // notifications to devices that have blocked notifications or have uninstalled
                  // your app. Expo does not control this policy and sends back the feedback from
                  // Apple and Google so you can handle it appropriately.
                  let receiptIds = [];
                  for (let ticket of tickets) {
                    // NOTE: Not all tickets have IDs; for example, tickets for notifications
                    // that could not be enqueued will have error information and no receipt ID.
                    if (ticket.id) {
                      receiptIds.push(ticket.id);
                    }
                  }

                  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
                  (async () => {
                    // Like sending notifications, there are different strategies you could use
                    // to retrieve batches of receipts from the Expo service.
                    for (let chunk of receiptIdChunks) {
                      try {
                        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                        console.log(receipts);

                        // The receipts specify whether Apple or Google successfully received the
                        // notification and information about an error, if one occurred.
                        for (let receiptId in receipts) {
                          let { status, message, details } = receipts[receiptId];
                          if (status === 'ok') {
                            continue;
                          } else if (status === 'error') {
                            console.error(
                              `There was an error sending a notification: ${message}`
                            );
                            if (details && details.error) {
                              // The error codes are listed in the Expo documentation:
                              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                              // You must handle the errors appropriately.
                              console.error(`The error code is ${details.error}`);
                            }
                          }
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }
                  })
                }
              }
            )
          }
        },
    };
  
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
  
    const subscriptionServer = SubscriptionServer.create(
      { schema, execute, subscribe },
      { server: httpServer, path: '/graphql' }
    );
  
    const server = new ApolloServer({
      schema,
      plugins: [{
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            }
          };
        }
      }],
    });
    await server.start();
    server.applyMiddleware({ app });
  
    //const PORT = 4000;
    httpServer.listen(process.env.PORT || 4000, () => {
        console.log(
            `🚀 Query endpoint ready at http://localhost:4000${server.graphqlPath}`
        );
        console.log(
            `🚀 Subscription endpoint ready at ws://localhost:4000${server.graphqlPath}`
        );
    });

    let currentNumber = 0;
    function incrementNumber() {
        currentNumber++;
        pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
        setTimeout(incrementNumber, 1000);
    }
  // Start incrementing
    incrementNumber();
})();