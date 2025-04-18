const mongoose = require("mongoose");

const bhavyaAyojanListSchema = new mongoose.Schema({
    ayojan_name:{type:String},
    slug_url:{type:String},
    ayojanImage :{type:String},
    ayojan_price:{type:String},
    meta_keywords:{type:String},
    meta_discription:{type:String},
    short_discription: { type: String},
    long_discription: { type: String},
    social_link:{
        instagram:{type:String,default:null},
        facebook:{type:String,default:null},
        youtube:{type:String,default:null},
    },
    status: { type: String, default: '1' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BhavyaAyojanList',bhavyaAyojanListSchema);