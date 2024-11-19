const PoojaSamagri = require('../models/poojaSamagri');

exports.createPoojaSamagri= async(req,res)=>{
    try{
        const addSamagri= new PoojaSamagri(req.body);
        await addSamagri.save();
        res.status(201).json(addSamagri);
    }
    catch ( error ){
        res.status(500).json({message:error.message});
    }
};

exports.getPoojaSamaagri = async(req, res) => {
    try{
        const Users=[
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
            { id: 3, name: 'Sam Green', email: 'sam@example.com' }
        ];
        res.json(users);
    }
    catch (error){
        res.status(500).json({message:error.message});
    }
}