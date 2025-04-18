const BrahmanBhoj = require('../models/brahmanBhojModel');
const generateNumericUUID = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(8, 14); // Extract HHMMSS from ISO format
  return `${timestamp}`;
};
    
exports.createBrahmanBhoj = async (req,res) => {
    try {
        console.log(req.body);
        const{
            userId,
            user_name,
            email,
            phone,
            date,
            attendees,
            address,
            street,
            city,
            state,
            zip_code,
            longitude,
            latitude,
            meal_type,
            occasion,
            notes,
        } = req.body;
        const newBrahmanBhoj = new BrahmanBhoj({
            userId,
            bhojId : "BRAHMANBHOJ"+generateNumericUUID(),
            bookingStatus : 1,
            user_name,
            email,
            phone,
            date,
            meal_type,
            occasion,
            attendees,
            address,
            street,
            city,
            state,
            zip_code,
            location:{
                longitude,
                latitude
            },notes,
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

exports.getBrahmanBhojByID = async (req, res) => {
    try {
        const { id } = req.params; // ✅ Corrected syntax
        const brahmanBhoj = await BrahmanBhoj.findById(id);
        
        if (!brahmanBhoj) {
            return res.status(404).json({ message: "No Brahman Bhoj Found", status: 0 });
        }

        res.status(200).json({ data: brahmanBhoj, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.getBrahmanBhojByuserID = async (req, res) => {
    try {
        const { userId } = req.params; // ✅ Corrected syntax
        const brahmanBhoj = await BrahmanBhoj.find({'userId':userId});
        if (!brahmanBhoj) {
            return res.status(404).json({ message: "No Brahman Bhoj Found", status: 0 });
        }
        res.status(200).json({ data: brahmanBhoj, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.cancelBrahmanByID = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBhoj = await BrahmanBhoj.findByIdAndUpdate(
            id,
            { bookingStatus: 2 }, 
            { new: true } 
        );
        if (!updatedBhoj) {
            return res.status(404).json({ message: "No Brahman Bhoj Found", status: 0 });
        }
        res.status(200).json({ message: "Brahman Bhoj Cancelled", status: 1});
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
