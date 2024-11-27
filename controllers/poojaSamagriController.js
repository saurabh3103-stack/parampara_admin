const PoojaSamagri = require('../models/poojaSamagri');

exports.createPoojaSamagri= async(req,res)=>{
    console.log(req.body)
    try{
        const addSamagri= new PoojaSamagri(req.body);
        await addSamagri.save();
        res.status(201).json({message:'Pooja Samagri Added',data:addSamagri,status:1});
    }
    catch ( error ){
        res.status(500).json({message:error.message,status:0});
    }
};
exports.getPoojaSamaagri = async(req, res) => {
    try{
       const poojaSamagri = await PoojaSamagri.find();
       res.status(200).json({message:'Pooja Samagri Data',data:poojaSamagri,status:1});
    }
    catch (error){
        res.status(500).json({message:error.message,status:0});
    }
}
exports.samagriByPoojaId = async(req,res)=>{
    try{
        const poojaId=req.params.id;
        const poojaSamagri = await PoojaSamagri.find({pooja_id:poojaId});
        if(poojaSamagri.length===0){
            res.status(404).json({message:'No Pooja Samagri Found',status:0});
        }
        res.status(200).json({message:'Pooja Samagri By pooja Id',data:poojaSamagri,status:1});
    }
    catch (error){
        res.status(500).json({message:error.message,status:0});

    }
}