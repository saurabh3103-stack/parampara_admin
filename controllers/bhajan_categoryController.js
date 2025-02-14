const multer = require('multer');
const fs = require('fs');
const path = require('path');
const BhajanCategory= require('../models/bhajan_categoryModel');

function ensureDirectoryExistence(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'bhajan_category');
        ensureDirectoryExistence(folderPath);
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
    }
};


const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
}).single('bhajan_image');

exports.createBhajanCategory = [
    upload,
    async (req, res) => {
        try {
            const { category, short_discription, long_discription, slug_url } = req.body;
            let bhajanImageUrl = null;
            if (req.file) {
                bhajanImageUrl = `uploads/bhajan_category/${req.file.filename}`;
            } else {
                return res.status(400).json({ message: "File is not defined", status: 0 });
            }

            const addbhajanCategory = new BhajanCategory({
                category,
                short_discription,
                long_discription,
                slug_url,
                bhajan_image: bhajanImageUrl
            });

            await addbhajanCategory.save();

            return res.status(200).json({
                message: 'Bhajan Category Created successfully',
                data: addbhajanCategory,
                status: 1
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
                status: 0
            });
        }
    }
];

exports.getbhajanCategory = async(req,res)=>{
    try{
        const bhajanCategory = await BhajanCategory.find();
        res.status(200).json({
            message:'Bhajan Category Data',
            status:1,
            data:bhajanCategory,
        });
    }
    catch (error){
        res.status(500).json({message:error.message,status:0});
    }
};

exports.getbhajanCategoryUser = async(req,res)=>{
    try{
        const bhajanCategory = await BhajanCategory.find({status:"active"});
        res.status(200).json({message:"Bhajan mandal Category",status:1,data:bhajanCategory});
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
};

exports.deletebhajanCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const bhajanCategory = await BhajanCategory.findById(id);

        if (!bhajanCategory) {
            return res.status(400).json({ message: "Bhajan Mandal Not found", status: 0 });
        }

        // Delete image if it exists
        if (bhajanCategory.bhajan_image) {
            const imagePath = path.join(__dirname, '..', 'public', bhajanCategory.bhajan_image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error("Error deleting image:", err);
                });
            }
        }

        // Delete the category from the database
        await BhajanCategory.findByIdAndDelete(id);

        res.status(200).json({ message: "Bhajan Category deleted successfully", status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};


exports.getbhajanCategoryById = async(req,res)=>{
    try{
        const { id } = req.params;
        const bhajanCategory = await BhajanCategory.findById(id);
        if(!bhajanCategory){
            return res.status(400).json({message:"Bhajan Mandal not found.",status:0});
        }
        res.status(200).json({message:"Pooja Category data retrieved successfully.",status:1,data:bhajanCategory});
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
};

exports.updateBhajanCategory = [
    upload,
    async (req,res)=>{
        try{
            const { id }= req.params;
            const { ...updatedDetails } = req.body;
            let bhajanCategory = await BhajanCategory.findById(id);
            if(!bhajanCategory){
                return res.status(400).json({message:'Bhajan Category not found!.',status:0});
            }
            if(req.file){
                if(bhajanCategory.bhajan_image){
                    const oldImagePath = path.json(__dirname,'..','public',bhajanCategory.bhajan_image);
                    if(fs.existsSync(oldImagePath)){
                        fs.unlinkSync(oldImagePath);
                    }
                }
            updatedDetails.bhajan_image=`/uploads/bhajan_categories/${req.file.filename}`;
            }
            bhajanCategory = await BhajanCategory.findByIdAndUpdate(
                id,
                {$set:updatedDetails},
                {new:true}
            );
            res.status(200).json({'message':'Bhajan Mandal Category Update Successfully',status:1,data:bhajanCategory});
        }
        catch (error){
            res.status(500).json({message:error.message,status:0})
        }
    },
];


exports.updateBhajanCategoryStatus = async (req, res) => {
    try {
        const { bhajanCategoryId, newStatus } = req.body;

        if (!bhajanCategoryId || newStatus === undefined) {
            return res.status(400).json({ message: 'Bhajan Mandal ID and status are required', status: 0 });
        }

        const bhajanCategory = await BhajanCategory.findByIdAndUpdate(
            bhajanCategoryId,
            { status: newStatus },
            { new: true }
        );

        if (!bhajanCategory) {
            return res.status(400).json({ message: 'Bhajan Mandal not found.', status: 0 });
        }

        res.status(200).json({ message: 'Bhajan Mandal status updated successfully', data: bhajanCategory, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};