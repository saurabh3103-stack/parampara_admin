const mongoose = require('mongoose');

const panditSchema = new mongoose.Schema({
  userID:{type:String},
  username: { type: String, required: true },
  name: {type: String, default : null },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  address: { type: String },
  longitude: { type: Number,default:null },
  latitude: { type: Number,default:null },
  password: { type: String, required: true },
  alternate_no: { type: String, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  city: { type: String },
  state: { type: String },
  fcm_tokken:{type:String,default:null},
  social_type: { type: String, enum: ['google', 'facebook', 'other'],default:null},
  image: { type: String, default: null },
  aadhar_no: { type: String, default: null },
  aadhar_image: { type: String },
  dob: { type: Date, default: null },
  country: { type: String },
  pincode: { type: String },
  skills: { type: String },
  account_type: { type: String },
  pancard_no: { type: String, default: null },
  degree: { type: String },
  bank_ac_no: { type: String },
  experience: { type: String, default: 0 },
  ifsc_code: { type: String },
  acc_holder_name: { type: String },
  bank_name: { type: String },
  bio: { type: String },
  type: { type: String },
  register_id: { type: String },
  booking_status: { type: String },
  profile_status:{type:String,default:"inactive"},
  status: { type: String, default: 'active' },
  otp: { type: String, default: null },
  otpExpire: { type: Date, default : null },
  approved: { type: Boolean, default: true },
  otp_verified: { type: Boolean, default: null },
  created_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pandit_table', panditSchema);
