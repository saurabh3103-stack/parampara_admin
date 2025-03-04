const mongoose = require('mongoose');

const bhajanMandalSchema = new mongoose.Schema({
    bhajan_name: { type: String, required: true },
    slug_url: { type: String, required: true },
    bhajan_category: { type: String, required: true },
    bhajan_image: { type: String },
    bhajan_price: { type: String, required: true },
    bhajan_member: { type: String, default: null },
    exp_year: { type: String, default: null },
    short_discription: { type: String, required: true },
    long_discription: { type: String, required: true },
    status: { type: String, default: '1' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    mandali_address: {
        address: { type: String },
        city: { type: String },
        location: { type: String },
        state: { type: String },
        country: { type: String },
        pin_code: { type: String },
        area: { type: String },
    },
    bhajan_owner: {
        owner_name: { type: String, required: true },
        owner_email: { type: String, required: true, unique: true },
        owner_phone: { type: String, required: true },
        owner_password: { type: String, required: true }
    }
});


module.exports = mongoose.model('BhajanMandal', bhajanMandalSchema);
