const mongoose = require('mongoose')

const recommedationSchema = new mongoose.Schema({
    recommend:{
        type:String,
        required:true
    },
    recommendedBy:{
        type:String,
        required:true
    },
    postId:{
        type:String,
        required:true
    },
    createdAt:{
    type:Date,
    default:Date.now()
    }
})

module.exports = mongoose.model('recommendation',recommedationSchema)