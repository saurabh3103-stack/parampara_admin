const mongoose = require('mongoose');

const poojaSamgriSchema = new mongoose.Schema({
    pooja_id: { type: String, required: true },
    samagriName: { type: String, required:true},
    samagriPrice: { type: String, required:true},
    short_discription:{type: String,require:true},
    long_discription:{type:Text , require:true},
    status: { type: String, require:true },
    updated_at:{ type: Date,},
    created_at: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model('PoojaSamagri', poojaSamgriSchema);
