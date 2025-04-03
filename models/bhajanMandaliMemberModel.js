const mongoose = require("mongoose");

const bhajanMndalMemberSchema = new mongoose.Schema({
        userID:{type:String},
        name:{type:String},
        role:{type:String},
        experience:{type:String},
        status:{type:String},
        createdAt: {type: Date,default: Date.now,},
        updatedAt: {type: Date,default: Date.now,},
    });

module.exports = mongoose.model("BhajanMndalMember",bhajanMndalMemberSchema);