const mongoose = require("mongoose");

const brahmanBhojSchema = new mongoose.Schema({
    bhojId: {
        type:String,
    },
    user_name:{
        type:String,   
    },
    email:{
        type:String,
    },
    phone: {
        type:String,
    },
    date:{
        type:Date,
    },
    attendees:{
        type:String,
    },
    address : {
        type:String,
    },
    location: {
        type:String,
    },
    notes:{
        type:String,
    },
    status:{
        type:String,
        default:1,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const brahmanBhoj = mongoose.model("BrahmanBhoj",brahmanBhojSchema);
module.exports = brahmanBhoj;