const mongoose = require('mongoose');

const bhavyaAyojanSchema = new mongoose.Schema({
    userId:{type:String,default:null},
    bookingId:{type:String,require:true},
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    event_type: { type: String, required: true },
    event_date: { type: Date, required: true },
    occasion: { type: String, required: true },
    guest_count: { type: Number, required: true },
    venue: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pin_code: { type: String, required: true }
    },
    special_requirements: { type: String },
    status: { type: String, default: 0 },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('bhavyaAyojan', bhavyaAyojanSchema);
