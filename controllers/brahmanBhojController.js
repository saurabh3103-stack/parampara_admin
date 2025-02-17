const BrahmanBhoj = require('../models/bhajanmandalModel');
const generateNumericUUID = () => {
    const uuid = uuidv4().replace(/-/g, ''); // Remove hyphens
    const numericId = uuid.split('').map(char => char.charCodeAt(0) % 10).join(''); // Convert each character to a number
    return numericId;
  };
exports.createBrahmanBhoj = async (req,res) => {
    try {
        const{
            user_name,
            email,
            phone,
            date,
            attendees,
            address,
            location,
            notes,
        } = req.body;
        const newBrahmanBhoj = new BrahmanBhoj({
            bhojId : generateNumericUUID(),
            user_name,email,
            phone,date,attendees,address,location,notes,
        });
        await newBrahmanBhoj.save();
        res.status(200).json({message:"Brahman Bhoj Save",status:1});
    }catch(error){
        res.status(500).json({message:error.message,status:0});
    }
};

exports.getBrahmanBhoj = async (req,res)=>{
    try {
        const brahmanBhoj = await BrahmanBhoj.find();
        if(brahmanBhoj.length === 0){
            return res.status(200).json({message:"No Brahaman Bhoj Found"})
        }
        res.status(200).json({data:brahmanBhoj,status:1});
    }catch (error){
        res.status(500).json({message:error.message,status:0})
    }
}