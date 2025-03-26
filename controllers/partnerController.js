const Partner = require('../models/partnerModel');
const Pandit = require('../models/panditModel');
const BhajanMandal = require('../models/bhajanmandalModel');

const bcrypt = require('bcryptjs');

exports.loginPartner = async (req, res) => {
    try {
        const { email, password, fcmToken } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required', status: 0 });
        }
        const partner = await Partner.findOne({ email });
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found', status: 0 });
        }
        const match = await bcrypt.compare(password, partner.password);
        if (!match) {
            return res.status(401).json({ message: 'Incorrect password', status: 0 });
        }
        if (fcmToken) {
            partner.fcm_tokken = fcmToken;
            await partner.save();
        }
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
