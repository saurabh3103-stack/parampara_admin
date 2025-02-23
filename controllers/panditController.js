const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Pandit = require('../models/panditModel');
const PanditCategory = require('../models/panditCategoryModel');
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
      const newPandit = new Pandit({
        ...otherDetails,
        password: hashedPassword,
        image: imagePath,
        aadhar_image: aadharImagePath,
      });
      await newPandit.save();
      const panditResponse = newPandit.toObject();
      delete panditResponse.password;
      res.status(200).json({ message: 'Pandit added', status: 1,data:panditResponse });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  },
];

exports.createPanditCategory = async(req,res) =>{
  try{
    console.log(req.body);
    const {pandit_id,name,pooja_id,pooja_name,category_status}=req.body;
    let status;
    if (category_status == 1) {
      status = 1;
    } else {
      status = 0;
    }  
    console.log(status);
    const category = await PanditCategory.findOneAndUpdate(
      { pandit_id, pooja_id },
      { name, pooja_name, status },
      { new: true, upsert: true }
    );
    res.status(200).json({message:'Category Updated',status:1,data:category});
  }
  catch(error){
    res.status(500).json({message:error.message,status:0});
  }
};

exports.updatePanditById = [
  upload, // Add your image upload middleware here
  async (req, res) => {
    try {
      const { id } = req.params; // Get Pandit ID from request params
      const { password, ...otherDetails } = req.body; // Extract password and other details

      // Check if password is being updated, if so, hash the new password
      let updatedData = { ...otherDetails };
      if (password) {
        const saltRounds = 10;
        updatedData.password = await bcrypt.hash(password, saltRounds);
      }

      // Handle image update if any (assuming you are saving the path of the image)
      if (req.file) {
        updatedData.image = req.file.path; // Store new image path
      }
      if (req.body.aadhar_image) {
        updatedData.aadhar_image = req.body.aadhar_image; // Update Aadhar image if provided
      }

      // Find the Pandit by ID and update
      const updatedPandit = await Pandit.findByIdAndUpdate(id, updatedData, { new: true });
      if (!updatedPandit) {
        return res.status(404).json({ message: 'Pandit not found', status: 0 });
      }

      // Remove the password from the response before sending back
      const panditResponse = updatedPandit.toObject();
      delete panditResponse.password;

      res.status(200).json({ message: 'Pandit updated successfully', status: 1, data: panditResponse });
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

exports.loginPandit = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;
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
    if (fcmToken) {
      pandit.fcm_tokken = fcmToken;
      await pandit.save();
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



exports.deletePanditById = async (req, res) => {
  try {
    const { id } = req.params; // Get Pandit ID from request params

    // Find and delete the Pandit by ID
    const deletedPandit = await Pandit.findByIdAndDelete(id);
    if (!deletedPandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Pandit deleted successfully', status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

// Get Pandit by ID
exports.getPanditById = async (req, res) => {
  try {
    const { id } = req.params; 
    const pandit = await Pandit.findById(id);
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }
    const panditResponse = pandit.toObject();
    delete panditResponse.password;

    res.status(200).json({
      message: 'Pandit data fetched successfully',
      status: 1,
      data: panditResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required', status: 0 });
    }
    // Find the pandit by email
    const pandit = await Pandit.findOne({ email });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pandit.otp = otp;
    otpExpire = Date.now() + 15 * 60 * 1000;
    await Pandit.findOneAndUpdate({ email }, { otp, otpExpire }, { new: true });
    // Send OTP via email using your global mail function
    // await sendMail({
    //   from: '"Your App Name" <no-reply@yourapp.com>',
    //   to: email,
    //   subject: 'Password Reset OTP',
    //   text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
    //   html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It is valid for 15 minutes.</p>`,
    // });
    res.status(200).json({ message: 'OTP sent to your email', status: 1, otp:otp });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.verifyOtppandit = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required', status: 0 });
    }
    // Find the pandit by email
    const pandit = await Pandit.findOne({ email });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }
    // Verify the OTP and check expiration

    if (!pandit.otp || pandit.otp.toString() !== otp.toString() || new Date(pandit.otpExpire) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP', status: 0 });
    }
    res.status(200).json({ message: 'OTP verified successfully', status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.resetpassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email, and new password are required', status: 0 });
    }
    // Find the pandit by email
    const pandit = await Pandit.findOne({ email });
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found', status: 0 });
    }
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    // Update the pandit's password and clear the OTP fields using an update query
    await Pandit.findOneAndUpdate(
      { email },
      { password: hashedPassword, otp: undefined, otpExpire: undefined },
      { new: true }
    );
    res.status(200).json({ message: 'Password reset successfully', status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};