const multer=require('multer');
const cloudinary = require('cloudinary').v2;  
const Pooja = require('../models/PoojaModel');

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb)=>{
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); 
      } else {
        cb(new Error('Invalid file type'), false); 
      }
};

const upload = multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{filesize:5*1024*1024},
}).single('image');

exports.createPooja=[ 
    upload,
    async(req,res)=>{
    try{
        const {...poojaDetails}=req.body;
        let imagePath=null;
        if(req.file){
            res.status(400).json({message:'Pooja Image  image is required', status: 0});
        }
        cloudinary.uploader.upload_stream(
            {resource_type:'auto'},
            async (error,result)=>{
                if(error){
                    res.status(500).json({message:"Error uploading to Cloudinary", error: error.message, status: 0});
                }
                const addPooja= new Pooja({
                    ...poojaDetails,
                    pooja_image:result.secure_url,
                    }); 
                try{
                    await addPooja.save();
                    res.status(200).json({message:'Pooja Data',data:addPooja,status:1});
                }   
                catch(err){
                    res.status(500).json({message:err.message});
                } 
            }
        ).end(req.file.buffer);
    }
    catch(error){
        res.status(500).json({message:error.message,status:0});
    }
}];

exports.getPooja = async(req, res) => {
    try{
        const pooja = await Pooja.find();
        res.json({message:'All Pooja Data',status:1,data:pooja});
    }
    catch (error){
        res.status(500).json({message:error.message});
    }
}
exports.getPoojaUser = async(req,res)=>{
    try{
        const pooja = await Pooja.find({status:'active'});
        res.json({message:'All Pooja For User',status:1,data:pooja});
    }
    catch (error){
        res.status(500).json({message:error.message,status:0});
    }
}
exports.updatePoojaStatus = async(req,res)=>{
    try{
        const { poojaId, newStatus }= req.body;
        if(!poojaId || !newStatus){
            res.status(200).json({message:'Pooja ID and status are required.' });
        }
        const updatedPooja = await Pooja.findByIdAndUpdate(
            poojaId,{status:newStatus},
            {new:true}
        );
        if(!updatedPooja){
            return res.status(404).json({ message: 'Pooja not found.' });
        }
        res.status(200).json({ message: 'Pooja status updated successfully', updatedPooja });

    }
    catch(error){

    }
}
exports.deletePooja = async(req,res)=>{
    try{    
        const poojaId = req.params.poojaId;
        if(!poojaId){
            res.status(400).json({message:'Pooja Id is required.',status:0});
        }
        const deletedPooja = await Pooja.findByIdAndDelete(poojaId);
        if(!deletedPooja){
            res.status(404).json({message:"Pooja Not Found.",status:0});
        }
        res.status(200).json({message:'Pooja Deleted Successfully',status:1});
    }
    catch( error ){
        res.status(500).json({message:error.message,status:0});
    }
}

