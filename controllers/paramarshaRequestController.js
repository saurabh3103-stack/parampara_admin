const ParamarshaRequest = require("../models/paramarshaRequestModel");

// Add new Paramarsha request (without payment)
exports.addparamarshaRequest = async (req, res) => {
    try {
        const newRequest = new ParamarshaRequest(req.body);
        const saved = await newRequest.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Confirm payment and update request
exports.confirmparamarshaPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            paymentAmmount: req.body.paymentAmmount,
            paymentStatus: "confirmed",
            transcationId: req.body.transcationId,
            transcationDate: new Date(),
            update_at: Date.now()
        };
        const updated = await ParamarshaRequest.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Request not found" });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update Paramarsha request
exports.updateparamarshaRequest = async (req, res) => {
    try {
        const updated = await ParamarshaRequest.findByIdAndUpdate(
            req.params.id,
            { ...req.body, update_at: Date.now() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: "Request not found" });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Paramarsha request
exports.deleteparamarshaRequest = async (req, res) => {
    try {
        const deleted = await ParamarshaRequest.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Request not found" });

        res.json({ success: true, message: "Request deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Assign Pandit
exports.assignparamarshaPandit = async (req, res) => {
    try {
        const updated = await ParamarshaRequest.findByIdAndUpdate(
            req.params.id,
            {
                assignPanditStatus: "1",
                paditId: req.body.paditId,
                update_at: Date.now()
            },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: "Request not found" });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update status
exports.updateparamarshaStatus = async (req, res) => {
    try {
        const updated = await ParamarshaRequest.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, update_at: Date.now() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: "Request not found" });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllparamarshaRequests = async (req, res) => {
    try {
        const allRequests = await ParamarshaRequest.find().sort({ created_at: -1 });
        res.json({ success: true, data: allRequests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getparamarshaRequestsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requests = await ParamarshaRequest.find({ userID: userId }).sort({ created_at: -1 });

        res.json({ success: true, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getparamarshaRequestDetails = async (req, res) => {
    try {
        const request = await ParamarshaRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });

        res.json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};