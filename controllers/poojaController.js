const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pooja = require('../models/PoojaModel');
const axios = require("axios");
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
 
// exports.createPooja = [
//   upload,
//   async (req, res) => {
//     console.log(req.body);
//     console.log(req.file);
//     try {
//       const {
//         pooja_name,
//         pooja_category,
//         pooja_Samegristatus,
//         price_withSamagri,
//         price_withoutSamagri,
//         short_discription,
//         long_discription,
//         samagriName,
//         samagriPrice,
//         samagrishort_discription,
//       } = req.body;
//       if (!pooja_name || !pooja_category || !price_withSamagri || !price_withoutSamagri || !short_discription || !long_discription) {
//         return res.status(400).json({ message: 'All required fields must be provided.', status: 0 });
//       }
//       let pooja_image = null;
//       if (req.file) {
//         pooja_image = `/uploads/pooja_images/${req.file.filename}`;
//       }

//       const newPooja = new Pooja({
//         pooja_name,
//         pooja_category,
//         pooja_Samegristatus,
//         price_withSamagri,
//         price_withoutSamagri,
//         pooja_image,
//         short_discription,
//         long_discription,
//       });
//       console.log('hellow');
//       await newPooja.save();
//       console.log('hellow success');
//       console.log((pooja_Samegristatus=="1"));
//       console.log((pooja_Samegristatus=="0"));
//       if (pooja_Samegristatus == "1") {
//         console.log('hellow Samagri');
//         const samagriPayload = {
//           pooja_id: newPooja._id,
//           samagriName:samagriName,
//           samagriPrice:samagriPrice,
//           short_discription:samagrishort_discription,
//         };
//         try {
//           const samagriApiUrl = "http://localhost:3000/api/pooja/add-samagri/"; 
//           const samagriResponse = await axios.post(samagriApiUrl, samagriPayload);
//           console.log("Samagri API response:", samagriResponse.data);
//         } catch (samagriError) {
//           console.error("Samagri API error:", samagriError.message);
//         }
//       }
//       res.status(201).json({ message: 'Pooja created successfully', data: newPooja, status: 1 });
//     } catch (error) {
//       res.status(500).json({ message: error.message, status: 0 });
//     }
//   },
// ];




exports.createPooja = [
  upload,
  async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
      const {
        pooja_name,
        pooja_category,
        pooja_Samegristatus,
        price_withSamagri,
        price_withoutSamagri,
        short_discription,
        long_discription,
        samagriName,
        samagriPrice,
        samagrishort_discription,
      } = req.body;

      if (
        !pooja_name ||
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

      const newPooja = new Pooja({
        pooja_name,
        pooja_category,
        pooja_Samegristatus,
        price_withSamagri,
        price_withoutSamagri,
        pooja_image,
        short_discription,
        long_discription,
      });

      console.log('hellow');
      await newPooja.save();
      console.log('hellow success');
      console.log(pooja_Samegristatus == '1');
      console.log(pooja_Samegristatus == '0');

      if (pooja_Samegristatus == '1') {
        console.log('hellow Samagri');

        // Create a mock req object
        const mockReq = httpMocks.createRequest({
          method: 'POST',
          url: '/api/pooja/add-samagri',
          body: {
            pooja_id: newPooja._id,
            samagriName: samagriName,
            samagriPrice: samagriPrice,
            short_discription: samagrishort_discription,
          },
        });

        // Create a mock res object
        const mockRes = httpMocks.createResponse();

        // Call createPoojaSamagri directly
        await createPoojaSamagri(mockReq, mockRes);

        const samagriResponseData = mockRes._getJSONData(); // Get JSON response from the mocked res
        console.log('Samagri response:', samagriResponseData);
      }

      res
        .status(201)
        .json({ message: 'Pooja created successfully', data: newPooja, status: 1 });
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

// Controller to delete a Pooja by ID
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
