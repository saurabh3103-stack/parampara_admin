const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pooja = require('../models/PoojaModel');
const httpMocks = require('node-mocks-http');
const { createPoojaSamagri } = require('../controllers/poojaSamagriController');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'pooja_images');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
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
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('pooja_image');

exports.createPooja = [
  upload,
  async (req, res) => {
    try {
      const {
        pooja_name,
        slug_url,
        pooja_category,
        pooja_Samegristatus,
        price_withSamagri,
        price_withoutSamagri,
        short_discription,
        long_discription,
        samagriData,
      } = req.body;

      if (
        !pooja_name ||
        !slug_url ||
        !pooja_category ||
        !price_withSamagri ||
        !price_withoutSamagri ||
        !short_discription ||
        !long_discription
      ) {
        return res
          .status(400)
          .json({ message: 'All required fields must be provided.', status: 0 });
      }

      let pooja_image = null;
      if (req.file) {
        pooja_image = `/uploads/pooja_images/${req.file.filename}`;
      }

      // Create the Pooja entry
      const newPooja = new Pooja({
        pooja_name,
        slug_url,
        pooja_category,
        pooja_Samegristatus,
        price_withSamagri,
        price_withoutSamagri,
        pooja_image,
        short_discription,
        long_discription,
      });

      await newPooja.save();
      console.log('Saved Pooja Data:', newPooja);

      // Handle samagri data if pooja_Samegristatus is 1
      if (pooja_Samegristatus == '1' && samagriData) {
        const samagriArray = JSON.parse(samagriData); 
        if (Array.isArray(samagriArray)) {
          for (const samagri of samagriArray) {
            const mockReq = httpMocks.createRequest({
              method: 'POST',
              url: '/api/pooja/add-samagri',
              body: {
                pooja_id: newPooja._id,
                samagriName: samagri.samagriName,
                samagriPrice: samagri.samagriPrice,
                short_discription: samagri.samagriDescription,
              },
            });

            const mockRes = httpMocks.createResponse();
            await createPoojaSamagri(mockReq, mockRes);
            const samagriResponseData = mockRes._getJSONData();
        console.log('Saved Samagri Data:', samagriResponseData);
          }
        }
      }

      res.status(201).json({
        message: 'Pooja created successfully',
        data: newPooja,
        status: 1,
      });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  },
];



exports.getPooja = async (req, res) => {
  try {
    const poojas = await Pooja.find();
    res.status(200).json({ message: 'All Pooja Data', data: poojas, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};


exports.getPoojaUser = async (req, res) => {
  try {
    const activePoojas = await Pooja.find({ status: 'active' });
    res.status(200).json({ message: 'Active Poojas', data: activePoojas, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};


// Controller to update Pooja status
exports.updatePoojaStatus = async (req, res) => {
  try {
    const { poojaId, newStatus } = req.body;

    if (!poojaId || !newStatus) {
      return res.status(400).json({ message: 'Pooja ID and status are required.', status: 0 });
    }

    const updatedPooja = await Pooja.findByIdAndUpdate(
      poojaId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedPooja) {
      return res.status(404).json({ message: 'Pooja not found.', status: 0 });
    }

    res.status(200).json({ message: 'Pooja status updated successfully', data: updatedPooja, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.getPoojaById = async (req,res)=>{
  try{
    const { id }= req.params;
    const poojaDetails = await Pooja.findOne({slug_url:id});
    if(!poojaDetails){
      return res.status(404).json({message:"Pooja Not Found",status:0});
    }
    return res.status(200).json({message:"Pooja Details",status:1,data:poojaDetails});
  }
  catch ( error ){
    res.status(500).json({message:error.message,status:0});
  }
}

exports.getPoojaUserbyID = async (req, res) => {
  try {
    const { id } = req.params;
    const poojaDetails = await Pooja.findOne({pooja_category: id });
    if (!poojaDetails) {
      return res.status(404).json({ message: "Pooja Not Found", status: 0 });
    }
    return res.status(200).json({ message: "Pooja Details", status: 1, data: poojaDetails });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.deletePooja = async (req, res) => {
  try {
    const { poojaId } = req.params;
    if (!poojaId) {
      return res.status(400).json({ message: 'Pooja ID is required.', status: 0 });
    }
    const deletedPooja = await Pooja.findByIdAndDelete(poojaId);
    if (!deletedPooja) {
      return res.status(404).json({ message: 'Pooja not found.', status: 0 });
    }
    res.status(200).json({ message: 'Pooja deleted successfully', status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.updatePoojaById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pooja_name,
      slug_url,
      pooja_category,
      pooja_Samegristatus,
      price_withSamagri,
      price_withoutSamagri,
      short_discription,
      long_discription,
    } = req.body;
    if (
      !pooja_name ||
      !slug_url ||
      !pooja_category ||
      !price_withSamagri ||
      !price_withoutSamagri ||
      !short_discription ||
      !long_discription
    ) {
      return res
        .status(400)
        .json({ message: 'All required fields must be provided.', status: 0 });
    }
    let updateData = {
      pooja_name,
      slug_url,
      pooja_category,
      pooja_Samegristatus,
      price_withSamagri,
      price_withoutSamagri,
      short_discription,
      long_discription,
    };
    if (req.file) {
      const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'pooja_images');
      const pooja_image = `/uploads/pooja_images/${req.file.filename}`;
      updateData.pooja_image = pooja_image;
      const poojaDetails = await Pooja.findById(id);
      if (poojaDetails && poojaDetails.pooja_image) {
        const oldImagePath = path.join(folderPath, poojaDetails.pooja_image.split('/').pop());
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    const updatedPooja = await Pooja.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPooja) {
      return res.status(404).json({ message: 'Pooja not found.', status: 0 });
    }
    res.status(200).json({
      message: 'Pooja updated successfully',
      data: updatedPooja,
      status: 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
