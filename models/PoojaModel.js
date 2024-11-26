const mongoose = require('mongoose');

const poojaSchema = new mongoose.Schema({
    pooja_name: { type: String, required: true },
    pooja_category: {type:String, required:true},
    pooja_Samegristatus:{type:String},
    price_withSamagri: { type: String, required: true },
    price_withoutSamagri: { type: String, required: true },
    pooja_image: { type: String},
    short_discription:{type: String,require:true},
    long_discription:{type: String , require:true},
    status: { type: String, default:'active' },
    updated_at:{ type: Date,default:Date.now},
    created_at: { type: Date, default: Date.now },
  });

module.exports = mongoose.model('Pooja', poojaSchema);
