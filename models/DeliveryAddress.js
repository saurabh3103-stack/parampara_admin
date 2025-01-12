const mongoose = require("mongoose");

const DeliveryAddressSchema = new mongoose.Schema({
  OrderId: { type: String, required: true },
  DeliveryAddress: {
    AddressLine1: { type: String, required: true },
    AddressLine2: { type: String, required: false }, 
    Landmark: { type: String, required: false }, 
    Location: { type: String, required: true }, 
    Latitude: { type: Number, required: true }, 
    Longitude: { type: Number, required: true }, 
    City: { type: String, required: true }, 
    State: { type: String, required: true }, 
    PostalCode: { type: String, required: true }, 
    Country: { type: String, required: true }, 
  },
});

module.exports = mongoose.model("DeliveryAddress", DeliveryAddressSchema);
