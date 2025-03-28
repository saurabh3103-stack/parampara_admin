const mongoose = require("mongoose");

const brahmanBhojSchema = new mongoose.Schema({
    userId: {
        type:String,
        default:null,
    },
    bhojId: {
        type:String,
    },
    bookingStatus:{
        type:String,
        default:0,
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
    meal_type:{
        type:String
    },
    occasion:{
        type:String
    },
    attendees:{
        type:String,
    },
    address : {
        type:String,
    },
    street:{
        type:String,
    },
    city:{
        type:String,
    },
    state:{
        type:String,
    },
    country:{
        type:String,
        default:null
    },
    zip_code:{
        type:String,
    },
    location: {
        longitude: { type: Number },
        latitude: { type: Number },
    },
    notes:{
        type:String,
    },
    status:{
        type:String,
        default:0,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const brahmanBhoj = mongoose.model("BrahmanBhoj",brahmanBhojSchema);
module.exports = brahmanBhoj;