const PanditRange = require('../models/PanditRangeModel');
const Commmission = require('../models/CommisionModel');


exports.createPanditRange = async(req,res)=>{
    try{
        const {range} = req.body;
        const newPanditRange = new PanditRange({range,});
        await newPanditRange.save();
        console.log(newPanditRange);
        return res.status(200).json({message:"Pandit Range Added successfully",range:newPanditRange,status:1});
    }catch (error){
        console.log(error.message);
        return res.status(500).json({message: "Error creating Pandit Range",error: error.message,status: 0,});
    }
};

exports.getPanditRange = async(req,res)=>{
    try{
        const PanditRange = await PanditRange.find();
        if(!PanditRange){
            return res.status(200).json({message:"No Pandit Range Found",status:0});
        }
        return res.status(200).json({message:"Pandit Range Found",data:PanditRange,status:1});
    }catch(error){
        console.log(error.message);
        return res.status(500).json({message:"Error in Find The Pandit Range", error: error.message,status:0});
    }
}

exports.updatePanditRange = async(req,res)=>{
    try{
        const { rangeId, range }= req.body;
        if(rangeId, range){
            return res.status(400).json({ message: 'Range ID and range are required.', status: 0 });
        }
        const updateRange = await PanditRange.findByIdAndUpdate(
            rangeId,
            {range:range}
        )
        if(!updateRange){
            return res.status(404).json({ message: 'Range not found.', status: 0 });
        }
        return  res.status(200).json({ message: 'Range updated successfully', data: updateRange, status: 1 });
    }catch(error){
        return res.status(500).json({message:"Error in Update The Pandit Range", error: error.message,status:0});
    }
}

exports.createCommision = async(req,res)=>{
    try{
        const {target,commision,commision_type} = req.body;
        const newCommission = new Commmission({target,commision,commision_type});
        await newCommission.save();
        console.log(newCommission);
        return res.status(200).json({message:"Pandit Range Added successfully",range:newCommission,status:1});
    }catch (error){
        console.log(error.message);
        return res.status(500).json({message: "Error creating Pandit Range",error: error.message,status: 0,});
    }
};

exports.getCommission = async(req,res)=>{
    try{
        const commmission = await Commmission.find();
        if(!commmission){
            return res.status(200).json({message:"No Pandit Range Found",status:0});
        }
        return res.status(200).json({message:"Pandit Range Found",data:commmission,status:1});
    }catch(error){
        console.log(error.message);
        return res.status(500).json({message:"Error in Find The Pandit Range", error: error.message,status:0});
    }
}

exports.updatecommmission = async(req,res)=>{
    try{
        const { commissionId,target,commision,commision_type }= req.body;
        if(commissionId,target,commision,commision_type){
            return res.status(400).json({ message: 'Range ID and range are required.', status: 0 });
        }
        const updatecommmission = await Commmission.findByIdAndUpdate(
            commissionId,
            {
                target:target,
                commision:commision,
                commision_type:commision_type
            }
        )
        if(!updatecommmission){
            return res.status(404).json({ message: 'Range not found.', status: 0 });
        }
        return  res.status(200).json({ message: 'Range updated successfully', data: updatecommmission, status: 1 });
    }catch(error){
        return res.status(500).json({message:"Error in Update The Pandit Range", error: error.message,status:0});
    }
}