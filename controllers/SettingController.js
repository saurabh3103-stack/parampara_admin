const PanditRange = require('../models/PanditRangeModel');
const Commmission = require('../models/CommisionModel'); // Ensure spelling is correct

exports.createPanditRange = async (req, res) => {
    try {
        const { range } = req.body;
        const newPanditRange = new PanditRange({ range });
        await newPanditRange.save();
        return res.status(200).json({ message: "Pandit Range Added successfully", range: newPanditRange, status: 1 });
    } catch (error) {
        console.error("Error creating Pandit Range:", error.message);
        return res.status(500).json({ message: "Error creating Pandit Range", error: error.message, status: 0 });
    }
};

exports.getPanditRange = async (req, res) => {
    try {
        const panditRange = await PanditRange.find();
        if (!panditRange || panditRange.length === 0) {
            return res.status(200).json({ message: "No Pandit Range Found", status: 0 });
        }
        return res.status(200).json({ message: "Pandit Range Found", data: panditRange, status: 1 });
    } catch (error) {
        console.error("Error fetching Pandit Range:", error.message);
        return res.status(500).json({ message: "Error fetching Pandit Range", error: error.message, status: 0 });
    }
};

exports.updatePanditRange = async (req, res) => {
    try {
        const { rangeId, range } = req.body;
        if (!rangeId || !range) {
            return res.status(400).json({ message: 'Range ID and range are required.', status: 0 });
        }
        const updateRange = await PanditRange.findByIdAndUpdate(rangeId, { range }, { new: true });
        if (!updateRange) {
            return res.status(404).json({ message: 'Range not found.', status: 0 });
        }
        return res.status(200).json({ message: 'Range updated successfully', data: updateRange, status: 1 });
    } catch (error) {
        console.error("Error updating Pandit Range:", error.message);
        return res.status(500).json({ message: "Error updating Pandit Range", error: error.message, status: 0 });
    }
};

exports.createCommision = async (req, res) => {
    try {
        const { target, commision, commision_type } = req.body;

        if (!target || !commision || !commision_type) {
            return res.status(400).json({ message: "All fields are required.", status: 0 });
        }

        // Check if commission for this target already exists
        const existingCommission = await Commmission.findOne({ target });
        if (existingCommission) {
            return res.status(409).json({
                message: `${target} commission already exists.`,
                status: 0
            });
        }

        const newCommission = new Commmission({ target, commision, commision_type });

        await newCommission.save();

        return res.status(201).json({
            message: `${target} commission created successfully`,
            data: newCommission,
            status: 1
        });

    } catch (error) {
        console.error("Error creating commission:", error.message);
        return res.status(500).json({
            message: "Error creating commission",
            error: error.message,
            status: 0
        });
    }
};

exports.getCommission = async (req, res) => {
    try {
        const commissions = await Commmission.find();
        if (commissions.length === 0) {
            return res.status(404).json({ message: "No commissions found.", status: 0 });
        }
        return res.status(200).json({
            message: "Commissions fetched successfully",
            data: commissions,
            status: 1
        });
    } catch (error) {
        console.error("Error fetching commissions:", error.message);
        return res.status(500).json({
            message: "Error fetching commissions",
            error: error.message,
            status: 0
        });
    }
};

exports.updateCommission = async (req, res) => {
    try {
        const { commissionId, target, commision, commision_type } = req.body;

        if (!commissionId || !target || !commision || !commision_type) {
            return res.status(400).json({ message: "All fields are required.", status: 0 });
        }

        const updatedCommission = await Commmission.findByIdAndUpdate(
            commissionId,
            { target, commision, commision_type },
            { new: true }
        );

        if (!updatedCommission) {
            return res.status(404).json({
                message: "Commission not found for the target.",
                status: 0
            });
        }

        return res.status(200).json({
            message: `${target} commission updated successfully`,
            data: updatedCommission,
            status: 1
        });

    } catch (error) {
        console.error("Error updating commission:", error.message);
        return res.status(500).json({
            message: "Error updating commission",
            error: error.message,
            status: 0
        });
    }
};
