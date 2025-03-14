const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); 
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const storage = multer.memoryStorage();

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
}).single('image');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'userImages' }, 
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); 
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream); 
  });
};

exports.createUser = [
  upload,
  async (req, res) => {
    try {
      const { password, ...otherDetails } = req.body;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      let imagePath = null;

      if (req.file) {
        imagePath = await uploadToCloudinary(req.file.buffer); 
      }

      const newUser = new User({
        ...otherDetails,
        password: hashedPassword,
        image: imagePath, 
      });

      await newUser.save();
      const userResponse = newUser.toObject();
      delete userResponse.password; 
      res.status(201).json({ message: 'User added', status: 1, data: userResponse });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  }
];
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ message: 'User Data', status: 1, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password, fcm_token } = req.body; // Accept fcm_token from request body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required", status: 0 });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 0 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password", status: 0 });
    }
    // Update FCM token in database
    if (fcm_token) {
      user.fcm_tokken = fcm_token;
      await user.save();
    }
    res.status(200).json({
      message: "Login successful",
      status: 1,
      data: { id: user._id, username: user.username, email: user.email, fcm_token: user.fcm_token }
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required", status: 0 });
    }
    const user = await User.findOne({ email: email });
    console.log(user );
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 0 });
    }
    const userResponse = user.toObject();
    delete userResponse.password; 
    res.status(200).json({ message: "User found", status: 1, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params; // Fetch ID from request parameters
    if (!id) {
      return res.status(400).json({ message: "User ID is required", status: 0 });
    }

    const user = await User.findById(id); // Find user by ID
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 0 });
    }

    const userResponse = user.toObject();
    delete userResponse.password; // Remove sensitive information

    res.status(200).json({ message: "User found", status: 1, data: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};


exports.updateUser = [
  upload,
  async (req, res) => {
    try {
      const { userId } = req.params;  // Extracting userId from params
      const updateData = req.body;  // Extracting the rest of the data from body
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found", status: 0 });
      }
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      if (req.file) {
        const imagePath = await uploadToCloudinary(req.file.buffer);
        updateData.image = imagePath;
      }
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      const userResponse = updatedUser.toObject();
      delete userResponse.password; 
      res.status(200).json({ message: "User updated successfully", status: 1, data: userResponse });
    } catch (error) {
      res.status(500).json({ message: error.message, status: 0 });
    }
  }
];


exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 0 });
    }
    user.status = status;
    await user.save();
    res.status(200).json({ message: "User status updated successfully", status: 1, data: { id: user._id, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

exports.forgetpassword = async (req,res)=>{
  try{
    const {email}=req.body;
    if(!email){
      res.status(200).json({message:'Email is required',status:0});
    }
    const user = await User.findOne({email});
    console.log(user);
    if(!user){
      return res.status(200).json({message:'User not found',status:0});
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    otpExpire = Date.now() + 15*60*1000;
    await User.findOneAndUpdate({email},{otp,otpExpire},{new:true});
    res.status(200).json({message:'OTP sent to your email',status:1,otp:otp});
  }catch(error){
    return res.status(500).json({message:error.message,status:0});
  }
}


exports.verifyOtpUser = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required', status: 0 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 0 });
    }
    console.log("Stored OTP:", user.otp);
    console.log("Stored OTP Expire:", user.otpExpire, typeof user.otpExpire);

    // Ensure `otpExpire` is a Date before comparing
    if (!user.otp || user.otp.toString() !== otp.toString() || new Date(user.otpExpire) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP', status: 0 });
    }

    res.status(200).json({ message: 'OTP verified successfully', status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};



exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email, and new password are required', status: 0 });
    }
    // Find the pandit by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 0 });
    }
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    // Update the pandit's password and clear the OTP fields using an update query
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword, otp: undefined, otpExpires: undefined },
      { new: true }
    );
    res.status(200).json({ message: 'Password reset successfully', status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};