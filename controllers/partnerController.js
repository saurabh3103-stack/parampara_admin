const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

// Models
const Partner = require('../models/partnerModel');
const Pandit = require('../models/panditModel');
const BhajanMandal = require('../models/bhajanmandalModel');
const BhajanMndalMember = require('../models/bhajanMandaliMemberModel');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '../public/uploads');
    
    switch(file.fieldname) {
      case 'image':
        uploadPath = path.join(uploadPath, 'user');
        break;
      case 'aadhar_image':
        uploadPath = path.join(uploadPath, 'aadhar');
        break;
      case 'bhajan_image':
        uploadPath = path.join(uploadPath, 'bhajan');
        break;
      case 'profile_image':
        uploadPath = path.join(uploadPath, 'profile');
        break;
      default:
        return cb(new Error('Invalid file type'));
    }
    
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Helper functions
const generateUserID = () => {
  return 'UID' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Clean up uploaded files on error
const cleanupFiles = (files) => {
  if (files) {
    Object.values(files).forEach(fileArray => {
      fileArray.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    });
  }
};


exports.loginPartner = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password, fcmToken } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required', status: 0 });
        }
        const partner = await Partner.findOne({ email });
        if (!partner) {
            return res.status(400).json({ message: 'Partner not found', status: 0 });
        }
        const match = await bcrypt.compare(password, partner.password);
        if (!match) {
            return res.status(401).json({ message: 'Incorrect password', status: 0 });
        }
        if (fcmToken) {
            partner.fcm_tokken = fcmToken;
            await partner.save();
        }
        console.log(partner.userID);
        let userData = { id: partner._id, username: partner.username, email: partner.email };
        // Check user_type and fetch corresponding data
        if (partner.user_type === 'pandit') {
            const pandit = await Pandit.findOne({ email });
            pandit.fcm_tokken = fcmToken;
            await pandit.save();
            const panditdata = await Pandit.findOne({ email });
            if (panditdata) {
                userData = { ...userData,'data':panditdata,'user_type':"pandit" };
            }
        } else if (partner.user_type === 'bhajan_mandal') {
            const bhajanMandal = await BhajanMandal.findOne({ "userID":partner.userID });
            console.log(bhajanMandal);
            await BhajanMandal.updateOne(
                    { _id: bhajanMandal._id },
                    { $set: { "bhajan_owner.fcm_tokken": fcmToken } }
            );
            const bhajanMandaldata = await BhajanMandal.findOne({ "userID":partner.userID });
            if (bhajanMandal) {
                userData = { ...userData, 'data': bhajanMandaldata,'user_type':"bhajan_mandal" };
            }
        }
        res.status(200).json({
            message: 'Login successful',
            status: 1,
            data: userData,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};


exports.registerPartner = [
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'aadhar_image', maxCount: 1 },
    { name: 'bhajan_image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 }
  ]),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { user_type } = req.body;
      
      // Validate user type
      if (!user_type || !['pandit', 'bhajan_mandal'].includes(user_type)) {
        cleanupFiles(req.files);
        return res.status(400).json({ 
          message: 'Invalid user type. Must be either "pandit" or "bhajan_mandal"', 
          status: 0 
        });
      }

      const userID = generateUserID();
      let panditId = null;
      let bhajanMandliId = null;

      // Validate required fields
      if (user_type === 'pandit') {
        const requiredFields = ['username', 'name', 'email', 'mobile', 'password'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          cleanupFiles(req.files);
          return res.status(400).json({ 
            message: `Missing required fields: ${missingFields.join(', ')}`, 
            status: 0 
          });
        }
      } else {
        const requiredFields = [
          'bhajan_name',
          'owner_name',
          'owner_email', 
          'owner_phone', 
          'owner_password'
        ];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          cleanupFiles(req.files);
          return res.status(400).json({ 
            message: `Missing required fields: ${missingFields.join(', ')}`, 
            status: 0 
          });
        }
      }

      // Check for existing user
      const email = user_type === 'pandit' ? req.body.email : req.body.owner_email;
      const mobile = user_type === 'pandit' ? req.body.mobile : req.body.owner_phone;
      
      const existingPartner = await Partner.findOne({ $or: [{ email }, { mobile }] }).session(session);
      if (existingPartner) {
        await session.abortTransaction();
        session.endSession();
        cleanupFiles(req.files);
        return res.status(400).json({ 
          message: 'Email or mobile already exists', 
          status: 0 
        });
      }

      // Hash password
      const passwordToHash = user_type === 'pandit' ? req.body.password : req.body.owner_password;
      const hashedPassword = await bcrypt.hash(passwordToHash, 10);

      // Handle file paths
      const imagePath = req.files?.image?.[0] ? `/uploads/user/${req.files.image[0].filename}` : null;
      const aadharImagePath = req.files?.aadhar_image?.[0] ? `/uploads/aadhar/${req.files.aadhar_image[0].filename}` : null;
      const bhajanImagePath = req.files?.bhajan_image?.[0] ? `/uploads/bhajan/${req.files.bhajan_image[0].filename}` : null;
      const profileImagePath = req.files?.profile_image?.[0] ? `/uploads/profile/${req.files.profile_image[0].filename}` : null;

      // Create partner record
      const partnerData = {
        userID,
        user_type,
        username: user_type === 'pandit' ? req.body.username : req.body.bhajan_name,
        name: user_type === 'pandit' ? req.body.name : req.body.owner_name,
        email,
        mobile,
        password: hashedPassword,
        status: '1',
        image: imagePath,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Add address fields
      if (user_type === 'pandit') {
        const addressFields = ['address', 'city', 'state', 'country', 'pincode'];
        addressFields.forEach(field => {
          if (req.body[field]) partnerData[field] = req.body[field];
        });
      } else {
        partnerData.address = req.body.mandali_address?.address || '';
        partnerData.city = req.body.mandali_address?.city || '';
        partnerData.state = req.body.mandali_address?.state || '';
        partnerData.country = req.body.mandali_address?.country || '';
        partnerData.pincode = req.body.mandali_address?.pin_code || '';
      }

      const newPartner = await Partner.create([partnerData], { session });

      // Create specific user type record
      if (user_type === 'pandit') {
        const panditData = {
          userID,
          username: req.body.username,
          name: req.body.name,
          email,
          mobile,
          password: hashedPassword,
          profile_status: "inactive",
          status: 'active',
          approved: true,
          otp_verified: false,
          image: imagePath,
          aadhar_image: aadharImagePath,
          created_at: new Date(),
          updated_at: new Date()
        };

        // Add pandit specific fields
        const panditFields = [
          'address', 'longitude', 'latitude', 'alternate_no', 'gender',
          'city', 'state', 'aadhar_no', 'dob', 'country', 'pincode', 
          'skills', 'account_type', 'pancard_no', 'degree', 'bank_ac_no', 
          'experience', 'ifsc_code', 'acc_holder_name', 'bank_name', 'bio', 
          'type', 'register_id'
        ];

        panditFields.forEach(field => {
          if (req.body[field] !== undefined) panditData[field] = req.body[field];
        });

        const newPandit = await Pandit.create([panditData], { session });
        panditId = newPandit[0]._id;
      } else {
        const bhajanMandalData = {
          userID,
          bhajan_name: req.body.bhajan_name,
          slug_url: req.body.slug_url || slugify(req.body.bhajan_name, { lower: true }),
          total_member: req.body.bhajan_member || '0',
          bhajan_category: req.body.bhajan_category || '',
          bhajan_image: bhajanImagePath,
          bhajan_price: req.body.bhajan_price || '',
          bhajan_member: req.body.bhajan_member || '',
          exp_year: req.body.exp_year || '',
          short_discription: req.body.short_discription || '',
          long_discription: req.body.long_discription || '',
          status: '1',
          created_at: new Date(),
          updated_at: new Date(),
          mandali_address: {
            address: req.body.mandali_address?.address || '',
            city: req.body.mandali_address?.city || '',
            location: req.body.mandali_address?.location || '',
            state: req.body.mandali_address?.state || '',
            country: req.body.mandali_address?.country || '',
            pin_code: req.body.mandali_address?.pin_code || '',
            area: req.body.mandali_address?.area || ''
          },
          social_link: {
            instagram: req.body.social_link?.instagram || null,
            facebook: req.body.social_link?.facebook || null,
            youtube: req.body.social_link?.youtube || null
          },
          bhajan_owner: {
            owner_name: req.body.owner_name,
            owner_email: email,
            owner_phone: mobile,
            fcm_tokken: null,
            owner_password: hashedPassword,
            aadhar_number: req.body.aadhar_number || null,
            aadhar_image: aadharImagePath,
            profile_image: profileImagePath
          },
          profile_status: "0"
        };

        const newBhajanMandal = await BhajanMandal.create([bhajanMandalData], { session });
        bhajanMandliId = newBhajanMandal[0]._id;

        if (req.body.members && Array.isArray(req.body.members)) {
          const memberPromises = req.body.members.map(member => {
            return BhajanMndalMember.create([{
              bhajanMandaliID: bhajanMandliId,
              name: member.name || '',
              role: member.role || '',
              experience: member.experience || '',
              status: '1',
              createdAt: new Date(),
              updatedAt: new Date()
            }], { session });
          });

          await Promise.all(memberPromises);
        }
      }

      await session.commitTransaction();
      session.endSession();

      // Prepare response data
      const responseData = {
        id: newPartner[0]._id,
        userID,
        username: newPartner[0].username,
        email: newPartner[0].email,
        user_type: newPartner[0].user_type
      };

      // Add type-specific IDs
      if (user_type === 'pandit') {
        responseData.panditId = panditId;
      } else {
        responseData.bhajanMandliId = bhajanMandliId;
      }

      return res.status(201).json({
        message: `${user_type === 'pandit' ? 'Pandit' : 'Bhajan Mandal'} registered successfully`,
        status: 1,
        data: responseData
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      cleanupFiles(req.files);
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: error.message, 
        status: 0 
      });
    }
  }
];