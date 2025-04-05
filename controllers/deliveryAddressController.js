// controllers/deliveryAddressController.js
const { v4: uuidv4 } = require("uuid");
const DeliveryAddress = require("../models/DeliveryAddress");
const PoojaBooking = require("../models/PoojaBooking");

// Add Delivery Address
const addDeliveryAddress = async (req, res) => {
  try {
    const { OrderId, userId, DeliveryAddress: AddressDetails } = req.body;
    
    if (!OrderId || !AddressDetails || !AddressDetails.AddressLine1 || 
        !AddressDetails.Location || !AddressDetails.City || 
        !AddressDetails.State || !AddressDetails.PostalCode || 
        !AddressDetails.Country) {
      return res.status(400).json({ 
        message: "Missing required fields in the delivery address" 
      });
    }

    const newDelivery = new DeliveryAddress({
      DeliveryId: uuidv4(),
      OrderId,
      userId,
      DeliveryAddress: AddressDetails,
    });

    await newDelivery.save();
    res.status(200).json({
      message: "Delivery address added successfully",
      delivery: newDelivery,
      status: 1
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding delivery address",
      error: error.message,
      status: 0
    });
  }
};

// Get Delivery Address by User ID
const getDeliveryAddressByUSerID = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ 
        message: "User Id is Required", 
        status: 0 
      });
    }

    const userDelivery = await DeliveryAddress.find({ userId: userId });
    if (!userDelivery || userDelivery.length === 0) {
      return res.status(200).json({ 
        message: "No Delivery Address Found", 
        status: 0 
      });
    }

    const formattedDelivery = userDelivery.map((delivery) => {
      const { Landmark, Location, ...rest } = delivery.DeliveryAddress;
      return {
        ...delivery.toObject(),
        DeliveryAddress: {
          ...rest,
          Landmark,
          Location,
        },
      };
    });

    res.status(200).json({ 
      message: "Delivery Address Found", 
      data: formattedDelivery, 
      status: 1 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error in Retrieving Delivery Data", 
      error: error.message, 
      status: 0 
    });
  }
};


const updateDeliveryAddressByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { DeliveryAddress: AddressDetails } = req.body;

    if (!userId || !AddressDetails || !AddressDetails.AddressLine1 || 
        !AddressDetails.Location || !AddressDetails.City || 
        !AddressDetails.State || !AddressDetails.PostalCode || 
        !AddressDetails.Country) {
      return res.status(400).json({ 
        message: "Missing required fields in the delivery address", 
        status: 0 
      });
    }

    const updatedDelivery = await DeliveryAddress.updateMany(
      { userId: userId },  // Find records by userId
      { $set: { DeliveryAddress: AddressDetails } }
    );
    

    if (!updatedDelivery) {
      return res.status(404).json({
        message: "No delivery address found for the given user and order ID",
        status: 0
      });
    }

    res.status(200).json({
      message: "Delivery address updated successfully",
      delivery: updatedDelivery,
      status: 1
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating delivery address",
      error: error.message,
      status: 0
    });
  }
};
// Get Delivery Address
const getDeliveryAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await DeliveryAddress.findOne({ OrderId: orderId });
    if (!delivery) {
      return res.status(200).json({ 
        message: "Delivery address not found" 
      });
    }
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving delivery address", 
      error: error.message 
    });
  }
};

// Get All Orders with Addresses
const getAllOrdersWithAddress = async (req, res) => {
  try {
    const orders = await PoojaBooking.find();
    const ordersWithAddresses = await Promise.all(orders.map(async (order) => {
      const delivery = await DeliveryAddress.findOne({ OrderId: order.OrderId });
      return {
        ...order.toObject(),
        DeliveryAddress: delivery ? delivery.DeliveryAddress : null,
      };
    }));

    if (ordersWithAddresses.length === 0) {
      return res.status(404).json({ 
        message: "No orders found" 
      });
    }

    res.json(ordersWithAddresses);
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving orders with addresses", 
      error: error.message 
    });
  }
};



module.exports = {
  addDeliveryAddress,
  getDeliveryAddress,
  getAllOrdersWithAddress,
  getDeliveryAddressByUSerID,
  updateDeliveryAddressByUserId
};