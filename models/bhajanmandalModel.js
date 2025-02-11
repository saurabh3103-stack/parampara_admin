const mongoose = require('mongoose');

const bhajanMandalSchema = new mongoose.Schema({
    bhajan_name:{type:String, required:true},
    slug_url:{type:String,required:true},
    bhajan_category:{type:String,required:true},
    bhajan_image:{type:String},
    bhajan_price:{type:String, required:true},
    bhajan_member:{type:String,default:null},
    short_discription:{type:String,required:true},
    long_discription:{type: String , require:true},
    status: { type: String, default:'1' },
    updated_at:{ type: Date,default:Date.now},
    created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('BhajanMandal',bhajanMandalSchema);