const mongoose = require('mongoose');

const poojaCategorySchema = new mongoose.Schema({
    category: { type: String, required: true },
    pooja_image: { type: String, required:true},
    short_discription:{type: String,require:true},
    long_discription:{type: String , require:true},
    status: { type: String, require:true },
    updated_at:{ type: Date,},
    created_at: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model('PoojaCategory', poojaCategorySchema);
