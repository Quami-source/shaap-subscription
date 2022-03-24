const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  type Comment{
    id:ID
    commentedBy:String
    commentTo:String
    postComment:String
    createdAt:Date
  }

  type Recommend{
    id:ID
    recommend:String
    recommendedBy:String
    postId:String
    createdAt:Date
  }

  type Comments{
    _id:ID
  }
  type Recommends{
    _id:ID
  }
  type Posts{
    id:ID
    postBody:String
    postedBy:String
    comments:[Comments]
    recommends:[Recommends]
    eventLocation:String
  }
    type Query {
      posts:[Posts]
      currentNumber: Int
    }
    type Subscription {
      postCreated:Posts
      commentAdded(commentId:String):Comment
    }
    type Mutation{
      addPost(eventLocation:String,postBody:String,postedBy:String):Posts
      addComment(commentTo:String,postComment:String,commentedBy:String):String
      addRecommendation(postId:String,recommend:String,recommendedBy:String):String
    }
 
`;

module.exports = typeDefs