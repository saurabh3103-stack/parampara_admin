const mongoose = require('mongoose');

const panditRangeSchema = new mongoose.Schema({
    range:{type:Number,default:null},
    status: { type: String, default: 'active' },
    created_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PanditRange",panditRangeSchema);