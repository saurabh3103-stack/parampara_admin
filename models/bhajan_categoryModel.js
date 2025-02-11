const mongoose = require('mongoose');

const bhajanCategorySchema = new mongoose.Schema({
    category: { type: String },
    bhajan_image: { type: String},
    short_discription:{type: String},
    slug_url: { type: String},
    long_discription:{type: String },
    status: { type: String, default:'active' },
    updated_at:{ type: Date,default:Date.now},
    created_at: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model('BhajanMandalCategory', bhajanCategorySchema);
