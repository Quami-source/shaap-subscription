const mongoose = require('mongoose')

const createPost = new mongoose.Schema({
    postBody:{
        type:String,
        required:true
    },
    postedBy:{
        type:String,
        required:true
    },
    eventLocation:{
        type:String,
        required:false
    },
    comments: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'newcomment'
    }],
    recommends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'recommedation'
    }],
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('ForumPost',createPost);