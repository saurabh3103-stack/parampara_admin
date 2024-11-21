const multer = require('multer');
const slider = require('../models/appSliderModel');
const path = require('path');

const storage =multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/slider/');
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


exports.createSlider =[ upload.single(image),
    async (req,res)=>{
    try{
        const addSlider=new slider(
        {
            name:req.body.name,
            category:req.body.category,
            image:req.file? '/uploads/slider/'+req.file.filename:null,
            status:req.body.status||'active',
            updated_at:Date.now(),
        });
        await addSlider.save();
        res.status(200).json({message:'Slider Create',status:1});
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
}];
exports.getSlider = async(req,res)=>{
    try{
        const Slider= await Slider.find();
        res.json({message:'All Slider',status:1,data:Slider});
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
}