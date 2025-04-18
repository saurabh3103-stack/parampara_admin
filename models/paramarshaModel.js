const mongoose = require('mongoose');

const paramarshaCategorySchema = new mongoose.Schema({
    name:{type:String},
    short_description:{type:String},
    long_discription:{type:String},
    featurd_image:{type:String},
    status:{type:String, default:1},
    created_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model("ParamarshaCategory",paramarshaCategorySchema);