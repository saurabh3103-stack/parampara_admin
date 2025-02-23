const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema({
    category_name:{
        type:String,
        required:true,
    },
    category_image:{
        type:String,
        default:null,
    },
    discription:{
        type:String,
        default:null
    },
    slug_url:{
        type:String,
        default:null
    },
    status:{
        type:String,
        default:1
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});

module.exports = mongoose.model("product_category",productCategorySchema);