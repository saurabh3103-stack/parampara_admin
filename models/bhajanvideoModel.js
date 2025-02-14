const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    bhajan_mandal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BhajanMandal', required: true },
    video_url: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date },
    uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BhajanVideo', videoSchema);
