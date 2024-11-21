const multer = require('multer');
const path = require('path');
const PoojaCategory = require('../models/PoojaCategory');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/userImages/');  
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); 
    } else {
      cb(new Error('Invalid file type'), false); 
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, 
});
  
exports.createPoojaCategory=[  
    upload.single('image'),  
    async(req,res)=>{
    try{
        const {...poojaCategoryDetails}=req.body;
        let imagePath = null;
        if (req.file) {
            imagePath = '/uploads/userImages/' + req.file.filename;  
        }
        const addPoojacategory= new PoojaCategory({
            ...poojaCategoryDetails,
            image:imagePath,
        });
        await addPoojacategory.save();
        res.status(201).json(addPoojacategory);
    }
    catch ( error ){
        res.status(500).json({message:error.message});
    }
}];

exports.getPoojaCategory = async(req, res) => {
    try{
        const poojaCategory = await PoojaCategory.find();
        res.json({message:'Pooja Category Data',status:1,data:poojaCategory});
    }
    catch (error){
        res.status(500).json({message:error.message,status:0});
    }
}