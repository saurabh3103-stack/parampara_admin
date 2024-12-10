const multer = require('multer');
const fs = require('fs');
const path = require('path');
const PoojaCategory = require('../models/PoojaCategory');

const ensureDirectoryExistence = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); 
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'pooja_categories');
    ensureDirectoryExistence(folderPath); 
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`; 
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).single('pooja_image');


exports.createPoojaCategory = [
  upload,
  async (req, res) => {
    try {
      const { ...poojaCategoryDetails } = req.body;

      let poojaImageUrl = null;

      if (req.file) {
        poojaImageUrl = `/uploads/pooja_categories/${req.file.filename}`; 
      }
      const addPoojaCategory = new PoojaCategory({
        ...poojaCategoryDetails,
        pooja_image: poojaImageUrl, 
      });

      await addPoojaCategory.save();

      return res.status(200).json({
        message: 'Pooja category created successfully.',
        data: addPoojaCategory,
        status: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  },
];


exports.getPoojaCategory = async (req, res) => {
  try {
    const poojaCategory = await PoojaCategory.find();
    res.status(200).json({
      message: 'Pooja Category Data',
      status: 1,
      data: poojaCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.getPoojaCategoryWeb = async (req, res) => {
  try {
    const poojaCategoryWeb = await PoojaCategory.find({ status: "active" });
    res.status(200).json({
      message: 'Pooja Category Data For Web',
      status: 1,
      data: poojaCategoryWeb,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.deletePoojaCategory = async(req, res)=> {
  try{
    const { id } = req.params;
    const poojaCategory = await PoojaCategory.findById(id);
    if(!poojaCategory){
      return res.status(404).json({message:"Pooja Category not found",status:0});
    }
    if(poojaCategory.pooja_image){
      const imagePath = path.join(__dirname, '..', 'public', poojaCategory.pooja_image);
      if(fs.existsSync(imagePath)){
        fs.unlinkSync(imagePath);
      }
    }
    await PoojaCategory.findByIdAndDelete(id);
    res.status(200).json({message:"Pooja Category deleted successfully",status:1,});
  }
  catch (error)
  {
    res.status(500).json({message:error.message,status:0});
  }
};

exports.getPoojaCategoryById = async (req,res)=>{
  try{
    const { id } = req.params;
    const poojaCategory = await PoojaCategory.findById(id);
    if(!poojaCategory){
      return res.status(404).json({message:"Pooja Category not Found.",status:0});
    }
    res.status(200).json({message:"Pooja Category data retrieved successfully.",status:1,data:poojaCategory,});
  }catch(error){
    res.status(500).json({message:error.message,status:0});
  }
};
exports.updatePoojaCategroy = [
  upload,
  async (req, res)=>{
    try{
      const { id } = req.params;
      const { ...updatedDetails } = req.body;
      let poojaCategroy = await PoojaCategory.findById(id);
      if(!poojaCategroy){
        return res.status(400).json({message:'Pooja category not found',status:0});
      }
      if(req.file){
        if(poojaCategroy.pooja_image){
          const oldImagePath = path.join(__dirname, '..', 'public', poojaCategory.pooja_image);
          if(fs.existsSync(oldImagePath)){
            fs.unlinkSync(oldImagePath);
          }
        }
        updatedDetails.pooja_image=`/uploads/pooja_categories/${req.file.filename}`;
      } 
      poojaCategory = await PoojaCategory.findByIdAndUpdate(
        id,
        {$set : updatedDetails},
        {new : true}
      );
      res.status(200).json({'message':'Pooja category update successfullty',status:1,data:poojaCategory,});
    }
    catch(error){
      res.status(500).json({message:error.message,status:0,});
    }
  },
];
exports.updatePoojaCategoryStatus = async (req, res) => {
  try {
    const { poojacategoryId, newStatus } = req.body;

    if (!poojacategoryId || !newStatus) {
      return res.status(400).json({ message: 'Pooja category ID and status are required.', status: 0 });
    }

    const updatedPoojaCategory = await PoojaCategory.findByIdAndUpdate(
      poojacategoryId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedPoojaCategory) {
      return res.status(404).json({ message: 'Pooja category not found.', status: 0 });
    }

    res.status(200).json({ message: 'Pooja category status updated successfully', data: updatedPoojaCategory, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};