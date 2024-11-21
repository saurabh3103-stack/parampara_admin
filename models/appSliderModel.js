const mongoose = require('mongoose');

const slider = new mongoose.Schema({
    name: { type: String, require: true },
    category:{type:String,require:true},
    image:{type:String, require:true},
    status: { type: String, default:true },
    updated_at:{ type: Date,},
    created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Slider', slider);

