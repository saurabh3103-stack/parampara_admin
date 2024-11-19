const Pooja = require('../models/PoojaModel');

exports.createPooja= async(req,res)=>{
    try{
        const addPooja= new Pooja(req.body);
        await addPooja.save();
        res.status(201).json(addPooja);
    }
    catch ( error ){
        res.status(500).json({message:error.message});
    }
};

exports.getPooja = async(req, res) => {
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