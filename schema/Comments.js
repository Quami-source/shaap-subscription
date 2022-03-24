const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    commentTo:{
        type:String,
        required:true
    },
    postComment:{
        type:String,
        required:true
    },
    commentedBy:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('newcomment',commentSchema)