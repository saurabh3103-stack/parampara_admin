const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Pandit = require('../models/panditModel');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/panditImages'); 
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); 
    }
    cb(null, uploadPath);
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
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'aadhar_image', maxCount: 1 },
]);

exports.createPandit = [
  upload,
  async (req, res) => {
    try {
      const { password, ...otherDetails } = req.body;

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      let imagePath = null;
      let aadharImagePath = null;

      // if (req.files.image) {
      //   imagePath = `/uploads/panditImages/${req.files.image[0].filename}`;
      // }
      // if (req.files.aadhar_image) {
      //   aadharImagePath = `/uploads/panditImages/${req.files.aadhar_image[0].filename}`;
      // }

      const newPandit = new Pandit({
        ...otherDetails,
        password: hashedPassword,
        image: imagePath,
        aadhar_image: aadharImagePath,
      });
      await newPandit.save();
      const panditResponse = newPandit.toObject();
      delete panditResponse.password;
      res.status(201).json({ message: 'Pandit added', status: 1 });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  },
];

// Get all Pandits
exports.getPandits = async (req, res) => {
  try {
    const pandits = await Pandit.find();
    res.json({ message: 'Pandit Data', status: 1, data: pandits });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

//get pandityBy id
// Fetch a Pandit by ID
// exports.getPanditById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const pandit = await Pandit.findById(id);

//     if (!pandit) {
//       return res.status(404).json({ message: 'Pandit not found', status: 0 });
//     }

//     res.json({ message: 'Pandit Data', status: 1, data: pandit });
//   } catch (error) {
//     res.status(500).json({ message: error.message, status: 0 });
//   }
// };

exports.getPanditByEmail = async (req, res) => {
  try {
    const { email } = req.body; // Expecting email in the request body
    const pandit = await Pandit.findOne({ email });

    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }

    res.json({ message: 'Pandit Data', status: 1, data: pandit });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};


exports.editPandit = [
  upload,
  async (req, res) => {
    try {
      const { email, password, ...otherDetails } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required for updating.", status: 0 });
      }

      // Find the Pandit by email
      const existingPandit = await Pandit.findOne({ email });
      if (!existingPandit) {
        return res.status(404).json({ message: "Pandit not found.", status: 0 });
      }

      // Update password if provided
      if (password) {
        const saltRounds = 10;
        otherDetails.password = await bcrypt.hash(password, saltRounds);
      }

      // Handle image uploads
      if (req.files?.image) {
        otherDetails.image = `/uploads/panditImages/${req.files.image[0].filename}`;
      }
      if (req.files?.aadhar_image) {
        otherDetails.aadhar_image = `/uploads/panditImages/${req.files.aadhar_image[0].filename}`;
      }

      // Update the Pandit details
      await Pandit.updateOne({ email }, { $set: otherDetails });

      const updatedPandit = await Pandit.findOne({ email }).select("-password");

      res.status(200).json({
        message: "Pandit details updated successfully.",
        status: 1,
        data: updatedPandit,
      });
    } catch (error) {
      console.error("Error updating Pandit:", error.message);
      res.status(500).json({ message: error.message, status: 0 });
    }
  },
];


exports.loginPandit = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required', status: 0 });
    }

    const pandit = await Pandit.findOne({ email });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }

    const match = await bcrypt.compare(password, pandit.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password', status: 0 });
    }

    res.status(200).json({
      message: 'Login successful',
      status: 1,
      data: { id: pandit._id, username: pandit.username, email: pandit.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};




// Controller: Get Pandit By Email
// exports.getPanditByEmail = async (req, res) => {
//   try {
//     const { email } = req.body; // Expecting email in the request body
//     const pandit = await Pandit.findOne({ email });

//     if (!pandit) {
//       return res.status(404).json({ message: 'Pandit not found', status: 0 });
//     }

//     res.json({ message: 'Pandit Data', status: 1, data: pandit });
//   } catch (error) {
//     res.status(500).json({ message: error.message, status: 0 });
//   }
// };

// Create Pandit and store email in sessionStorage

// Fetch Pandit details using stored email
// const fetchPanditDetails = async () => {
//   const storedEmail = sessionStorage.getItem("storedEmail");
//   if (!storedEmail) {
//     console.error("No email found in sessionStorage");
//     return;
//   }

//   try {
//     const response = await axios.post("http://localhost:3000/api/pandit/get-pandit-by-email", {
//       email: storedEmail,
//     });

//     console.log("Fetched Pandit Details:", response.data);
//   } catch (error) {
//     console.error("Error fetching Pandit details:", error.response?.data?.message || error.message);
//   }
// };
