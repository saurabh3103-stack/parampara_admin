const multer = require('multer');
const sliderCategory = require('../models/appSliderCategoryModel');
const path = require('path');

const storage =multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/sliderCategory/');
    },
    filename:(req,file,cb)=>{
        cb(null,Date,now() + path.extname(file.originalname));
    },
});
const fileFilter = (req,file,cb)=>{
    const allowedTypes = ['image/jpeg','image/png','image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);
    }
    else{
        cb(new Error('Invailed file type'),false);
    }
};
const upload = multer(
    {
        storage:storage,
        fileFilter:fileFilter,
        limits:{fileSize:5*1024*1024}
    });

exports.createSliderCategory = [upload.single(image),
    async (req,res) => {
    try{
        const addSlidercategory= new sliderCategory(
            {
                name: req.body.name,
                image:req.file? '/uploads/sliderCategory/'+req.file.filename:null,
                status: req.body.status||'active',
                updated_at:Date.now(),
            });
        await addSlidercategory.save();
        res.status(200).json({message:'Slider Category Add',status:1});
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
}];
exports.getSliderCategory= async(req,res)=>{
    try{
        const SliderCategory= await SliderCategory.find();
        res.json({message:'All Slider Category',status:1,data:SliderCategory});
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
}