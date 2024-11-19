const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    location: { type: String, required: true },
    area: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
});

module.exports = mongoose.model('Location', locationSchema);
