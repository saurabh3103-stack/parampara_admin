const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    userID:{type:String},
    user_type: { type: String, required: true, enum: ['pandit', 'bhajan_mandal'] }, 
    username: { type: String }, 
    name: { type: String }, 
    email: { type: String, required: true, unique: true }, 
    mobile: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    address: { type: String }, 
    city: { type: String }, 
    state: { type: String }, 
    country: { type: String }, 
    pincode: { type: String }, 
    image: { type: String, default: null }, 
    fcm_tokken:{type:String,default:null},
    status: { type: String, default: 1 }, 
    created_at: { type: Date, default: Date.now }, 
    updated_at: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Partner', partnerSchema);