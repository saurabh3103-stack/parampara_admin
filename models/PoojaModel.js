const mongoose = require('mongoose');

const poojaSchema = new mongoose.Schema({
    pooja_name: { type: String, required: true },
    pooja_category: {type:String, required:true},
    price_withSamagri: { type: String, required: true },
    price_withoutSamagri: { type: String, required: true },
    pooja_image: { type: String, required:true},
    short_discription:{type: String,require:true},
    long_discription:{type:Text , require:true},
    status: { type: String, require:true },
    updated_at:{ type: Date,},
    created_at: { type: Date, default: Date.now },
  });

module.exports = mongoose.model('Pooja', poojaSchema);
