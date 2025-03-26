const mongoose = require("mongoose");

const bookedUserSchema = new mongoose.Schema({
    userId: { type: String , required: true }, 
    partnerId: { type: String, required: true }, 
    user_type: { type: String, required: true }, 
    product_type: { 
        product_id:{type:String},
        product_name:{type:String},
     }, 
    booking_date: { type: Date, required: true },
    booking_time: { type: String, required: true }, 
    status: { type: String, default: 0 }, 
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BookedUser", bookedUserSchema);
