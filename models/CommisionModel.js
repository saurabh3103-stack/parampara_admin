const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    target:{type:String},
    commision:{type:Number},
    commision_type:{type:String},
    status: { type: String, default: 1 },
    created_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("commission",commissionSchema);