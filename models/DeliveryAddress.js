const mongoose = require("mongoose");

const DeliveryAddressSchema = new mongoose.Schema({
  DeliveryId: { type: String, required: true },
  OrderId: { type: String, required: true },
  DeliveryAddress: {
    Street: { type: String, required: true },
    City: { type: String, required: true },
    State: { type: String, required: true },
    PostalCode: { type: String, required: true },
    Country: { type: String, required: true },
  },
});

module.exports = mongoose.model("DeliveryAddress", DeliveryAddressSchema);