const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  address: { type: String },
  longitude: { type: Number },
  latitude: { type: Number },
  password: { type: String, required: true },
  alternate_no: { type: String, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  city: { type: String },
  state: { type: String },
  fcm_tokken:{type:String,default:null},
  landmark: { type: String },
  social_type: { type: String, enum: ['google', 'facebook', 'other'],default:null},
  image: { type: String, default: null },
  aadhar_no: { type: String, default: null },
  dob: { type: Date, default: null },
  country: { type: String },
  pincode: { type: String },
  status: { type: String, default: 'active' },
  otp: { type: String, default: null },
  approved: { type: Boolean, default: true },
  otp_verified: { type: Boolean, default: null },
  created_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
