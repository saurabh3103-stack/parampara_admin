const PoojaCategory = require('../models/PoojaCategory');

exports.createPoojaCategory= async(req,res)=>{
    try{
        const addPoojacategory= new PoojaCategory(req.body);
        await addPoojacategory.save();
        res.status(201).json(addPoojacategory);
    }
    catch ( error ){
        res.status(500).json({message:error.message});
    }
};

exports.getPoojaCategory = async(req, res) => {
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