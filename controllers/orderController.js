const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const DeliveryAddress = require("../models/DeliveryAddress");

// Create Product Order
const createOrder = async (req, res) => {
  try {
    const {
      ProductId,
      ProductName,
      Amount,
      Quantity,
      ProductType,
      Date,
      Time,
      UserId,
      Username,
      ContactNumber,
      Email,
    } = req.body;
    const date = new Date();
    const isoString = date.toISOString(); 
    const id = isoString.replace(/[-:TZ.]/g, '');

    const newOrder = new Order({
      OrderId:id,
      ProductId,
      ProductName,
      Amount,
      Quantity,
      ProductType,
      Date: ProductType === "Pooja Bhajan Mandal" ? Date : null,
      Time: ProductType === "Pooja Bhajan Mandal" ? Time : null,
      User: {
        UserId,
        Username,
        ContactNumber,
        Email,
      },
    });

    await newOrder.save();
    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// Get Product Order Details
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ OrderId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving order", error: error.message });
  }
};

// Add Delivery Address
const addDeliveryAddress = async (req, res) => {
  try {
    const { OrderId, DeliveryAddress: AddressDetails } = req.body;

    const newDelivery = new DeliveryAddress({
      DeliveryId: uuidv4(),
      OrderId,
      DeliveryAddress: AddressDetails,
    });

    await newDelivery.save();
    res.status(201).json({ message: "Delivery address added successfully", delivery: newDelivery });
  } catch (error) {
    res.status(500).json({ message: "Error adding delivery address", error: error.message });
  }
};


// Get Delivery Address
const getDeliveryAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await DeliveryAddress.findOne({ OrderId: orderId });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery address not found" });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving delivery address", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrder,
  addDeliveryAddress,
  getDeliveryAddress,
};