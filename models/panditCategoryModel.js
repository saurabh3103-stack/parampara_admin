const mongoose = require('mongoose');

const panditCategorySchema = new mongoose.Schema({
    pandit_id:{
        type : mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Pandit_table",
    },
    name : {
        type:"String",
        default:null,
    },
    pooja_id:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Pooja",
    },
    pooja_name:{
        type:"String",
        default:null,
    },
    status:{
        type:"String",
        default:1,
    },
    updated_at:{ 
        type: Date,
        default:Date.now
    },
    created_at: { 
        type: Date, 
        default: Date.now
    },

});

module.exports = mongoose.model('Pandit_Category',panditCategorySchema);