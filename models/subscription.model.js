const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    subscriber : { // the user who is subscribing
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    channel : { // to which user , the above user is subscribing
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }

},{timestamps : true})

module.exports = mongoose.model("Subscription" , subscriptionSchema);