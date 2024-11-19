const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require:true },
    status: { type: String, require:true },
    updated_at:{ type: Date,},
    created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Admin', adminSchema);

