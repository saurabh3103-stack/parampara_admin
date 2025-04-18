const mongoose = require('mongoose');

const kundaliSchema = new mongoose.Schema({
  // General Kundali Fields
  name: {
    type: String,
    required: function () {
      return !this.isMatching;
    },
    trim: true,
  },
  userId: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: function () {
      return !this.isMatching;
    },
  },
  dateOfBirth: {
    type: Date,
    required: function () {
      return !this.isMatching;
    },
  },
  timeOfBirth: {
    type: String,
    required: function () {
      return !this.isMatching;
    },
  },
  placeOfBirth: {
    type: String,
    required: function () {
      return !this.isMatching;
    },
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
  },
  discription: {
    type: String,
  },
  language: {
    type: String,
  },

  // Kundali Matching Section
  isMatching: {
    type: Boolean,
    default: false,
  },
  matchingDetails: {
    groomName: String,
    groomDOB: Date,
    groomTimeOfBirth: String,
    groomPlaceOfBirth: String,
    brideName: String,
    brideDOB: Date,
    brideTimeOfBirth: String,
    bridePlaceOfBirth: String,
    matchScore: {
      type: Number,
      min: 0,
      max: 36,
    },
    remarks: String,
  },

  // Transaction Section
  transactionId: {
    type: String,
  },
  transactionStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending',
  },
  transactionAmount: {
    type: String,
  },
  transactionDate: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: '1',
  },
});

module.exports = mongoose.model('Kundali', kundaliSchema);
