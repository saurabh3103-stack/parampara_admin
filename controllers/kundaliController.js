const Kundali = require('../models/kundaliModel');

// Create a new Kundali Request
exports.createKundali = async (req, res) => {
    try {
      const kundali = new Kundali({
        ...req.body,
        transactionStatus: req.body.transactionStatus || 'Pending',
        transactionId: req.body.transactionId || null,
        transactionAmount: req.body.transactionAmount || null,
        transactionDate: req.body.transactionDate || null,
      });
      const savedKundali = await kundali.save();
      res.status(201).json({ success: true, data: savedKundali });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
  

// Get all Kundali Requests
exports.getAllKundalis = async (req, res) => {
  try {
    const kundalis = await Kundali.find({ isMatching: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: kundalis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Kundali Request by ID
exports.getKundaliById = async (req, res) => {
  try {
    const kundali = await Kundali.findOne({ _id: req.params.id, isMatching: false });
    if (!kundali) {
      return res.status(404).json({ success: false, message: 'Kundali not found' });
    }
    res.status(200).json({ success: true, data: kundali });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Kundali Request
exports.updateKundali = async (req, res) => {
  try {
    const updated = await Kundali.findOneAndUpdate(
      { _id: req.params.id, isMatching: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Kundali not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Cancel Kundali Request
exports.cancelKundali = async (req, res) => {
  try {
    const cancelled = await Kundali.findOneAndUpdate(
      { _id: req.params.id, isMatching: false },
      { status: '0' },
      { new: true }
    );
    if (!cancelled) {
      return res.status(404).json({ success: false, message: 'Kundali not found' });
    }
    res.status(200).json({ success: true, data: cancelled });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete Kundali Request
exports.deleteKundali = async (req, res) => {
  try {
    const deleted = await Kundali.findOneAndDelete({ _id: req.params.id, isMatching: false });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Kundali not found' });
    }
    res.status(200).json({ success: true, message: 'Kundali deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// Kundali Matching Controllers
// ===========================

// Create a new Kundali Matching request

exports.createKundaliMatching = async (req, res) => {
    try {
      const data = {
        isMatching: true,
        contactNumber: req.body.contactNumber,
        email: req.body.email,
        address: req.body.address,
        transactionStatus: req.body.transactionStatus || 'Pending',
        transactionId: req.body.transactionId || null,
        transactionAmount: req.body.transactionAmount || null,
        transactionDate: req.body.transactionDate || null,
        matchingDetails: {
          groomName: req.body.matchingDetails?.groomName,
          groomDOB: req.body.matchingDetails?.groomDOB,
          groomTimeOfBirth: req.body.matchingDetails?.groomTimeOfBirth,
          groomPlaceOfBirth: req.body.matchingDetails?.groomPlaceOfBirth,
          brideName: req.body.matchingDetails?.brideName,
          brideDOB: req.body.matchingDetails?.brideDOB,
          brideTimeOfBirth: req.body.matchingDetails?.brideTimeOfBirth,
          bridePlaceOfBirth: req.body.matchingDetails?.bridePlaceOfBirth,
        },
      };
  
      // Optional fields: only set if provided
      if (req.body.userId) data.userId = req.body.userId;
      if (req.body.name) data.name = req.body.name;
  
      const matchingRequest = new Kundali(data);
      const saved = await matchingRequest.save();
  
      res.status(201).json({ success: true, data: saved });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
  
  
  

// Get all Kundali Matching requests
exports.getAllMatchingRequests = async (req, res) => {
  try {
    const matchings = await Kundali.find({ isMatching: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: matchings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single Kundali Matching request by ID
exports.getMatchingById = async (req, res) => {
  try {
    const matching = await Kundali.findOne({ _id: req.params.id, isMatching: true });
    if (!matching) {
      return res.status(404).json({ success: false, message: 'Matching request not found' });
    }
    res.status(200).json({ success: true, data: matching });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Kundali Matching details
exports.updateMatchingDetails = async (req, res) => {
    try {
      const existing = await Kundali.findOne({ _id: req.params.id, isMatching: true });
  
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Matching request not found' });
      }
  
      // Create an update object only with allowed fields
      const newDetails = {
        ...existing.matchingDetails.toObject(),
        ...req.body.matchingDetails,
      };
  
      // If not admin, remove matchScore and remarks from update
      if (!req.user || req.user.role !== 'admin') {
        delete newDetails.matchScore;
        delete newDetails.remarks;
      }
  
      existing.matchingDetails = newDetails;
  
      const updated = await existing.save();
  
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
  

// Delete a Kundali Matching request
exports.deleteMatchingRequest = async (req, res) => {
  try {
    const deleted = await Kundali.findOneAndDelete({ _id: req.params.id, isMatching: true });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Matching request not found' });
    }
    res.status(200).json({ success: true, message: 'Matching request deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { transactionStatus, transactionId, transactionAmount, transactionDate } = req.body;
  
      const updated = await Kundali.findByIdAndUpdate(
        id,
        {
          ...(transactionStatus && { transactionStatus }),
          ...(transactionId && { transactionId }),
          ...(transactionAmount && { transactionAmount }),
          ...(transactionDate && { transactionDate }),
        },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Kundali not found' });
      }
  
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  exports.getKundalisByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const kundalis = await Kundali.find({ userId, isMatching: false }).sort({ createdAt: -1 });
  
      res.status(200).json({ success: true, data: kundalis });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  exports.getMatchingsByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const matchings = await Kundali.find({ userId, isMatching: true }).sort({ createdAt: -1 });
  
      res.status(200).json({ success: true, data: matchings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };