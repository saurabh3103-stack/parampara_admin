const { v4: uuidv4 } = require("uuid");
const PoojaBooking = require("../models/PoojaBooking");
const DeliveryAddress = require("../models/DeliveryAddress");

const generateNumericUUID = () => {
    const uuid = uuidv4().replace(/-/g, ''); // Remove hyphens
    const numericId = uuid.split('').map(char => char.charCodeAt(0) % 10).join(''); // Convert each character to a number
    return numericId;
  };
    
// Create Pooja Booking

const createPoojaBooking = async (req, res) => {
  console.log(req.body);
  try {
    const {
      poojaId,
      poojaName,
      poojaType,
      isSamagriIncluded,
      date,
      time,
      userId,
      username,
      contactNumber,
      email,
      amount,
      quantity,
    } = req.body;
    const newPoojaBooking = new PoojaBooking({
      bookingId: generateNumericUUID(),
      poojaDetails: {
        poojaId,
        poojaName,
        poojaType,
        isSamagriIncluded,
      },
      userDetails: {
        userId,
        username,
        contactNumber,
        email,
      },
      schedule: {
        date,
        time,
      },
      paymentDetails: {
        amount,
        quantity,
      },
    });
    await newPoojaBooking.save();
    console.log(newPoojaBooking);
    res.status(201).json({
      message: "Pooja booking created successfully",
      poojaBooking: newPoojaBooking,
      status: 1,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Error creating Pooja booking",
      error: error.message,
      status: 0,
    });
  }
};

// Update pooja booking confirm 
const updatePoojaBooking = async (req, res) => {
  console.log(req.body);
  try {
    const { bookingId, transactionId, transactionStatus, transactionDate } = req.body;

    // Validate required fields
    if (!bookingId || !transactionId || !transactionStatus || !transactionDate) {
      return res.status(400).json({
        message: "Missing required fields: bookingId, transactionId, transactionStatus, or transactionDate.",
        status: 0,
      });
    }

    // Find the PoojaBooking by bookingId
    const poojaBooking = await PoojaBooking.findOne({ bookingId });

    if (!poojaBooking) {
      return res.status(404).json({
        message: "Pooja booking not found",
        status: 0,
      });
    }

    // Update bookingStatus and transaction details
    poojaBooking.bookingStatus = 1; // Mark as confirmed
    poojaBooking.transactionDetails = {
      transactionId,
      transactionStatus,
      transactionDate,
    };

    // Save the updated booking
    await poojaBooking.save();

    res.status(200).json({
      message: "Pooja booking updated successfully",
      poojaBooking,
      status: 1,
    });
  } catch (error) {
    console.error("Error updating Pooja booking:", error.message);
    res.status(500).json({
      message: "Error updating Pooja booking",
      error: error.message,
      status: 0,
    });
  }
};


// Get Product Order Details
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await PoojaBooking.findOne({ bookingId: orderId });

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
      // Destructuring the input from request body
      const { OrderId, DeliveryAddress: AddressDetails } = req.body;
  
      // Validation for required fields
      if (!OrderId || !AddressDetails || !AddressDetails.AddressLine1 || !AddressDetails.Location || !AddressDetails.Latitude || !AddressDetails.Longitude || !AddressDetails.City || !AddressDetails.State || !AddressDetails.PostalCode || !AddressDetails.Country) {
        return res.status(400).json({ message: "Missing required fields in the delivery address" });
      }
  
      // Create a new DeliveryAddress entry
      const newDelivery = new DeliveryAddress({
        DeliveryId: uuidv4(),
        OrderId,
        DeliveryAddress: AddressDetails,
      });
  
      // Save the new delivery address to the database
      await newDelivery.save();
  
      // Respond with success message and the newly created delivery address
      res.status(200).json({
        message: "Delivery address added successfully",
        delivery: newDelivery,
        status:1
      });
    } catch (error) {
      // Handle errors and send back error message
      res.status(500).json({
        message: "Error adding delivery address",
        error: error.message,
        status:0
      });
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

const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find(); // Fetch all orders from the database
  
      if (orders.length === 0) {
        return res.status(404).json({ message: "No orders found" });
      }
  
      res.json(orders); // Send all orders in the response
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders", error: error.message });
    }
};

const getAllOrdersWithAddress = async (req, res) => {
    try {
      const orders = await Order.find(); // Fetch all orders
  
      // For each order, find the corresponding delivery address
      const ordersWithAddresses = await Promise.all(orders.map(async (order) => {
        const delivery = await DeliveryAddress.findOne({ OrderId: order.OrderId });
        return {
          ...order.toObject(),
          DeliveryAddress: delivery ? delivery.DeliveryAddress : null,
        };
      }));
  
      if (ordersWithAddresses.length === 0) {
        return res.status(404).json({ message: "No orders found" });
      }
  
      res.json(ordersWithAddresses); // Send orders along with delivery address
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders with addresses", error: error.message });
    }
  };
  
module.exports = {
  createPoojaBooking,
  getOrder,
  addDeliveryAddress,
  getDeliveryAddress,
  getAllOrders,
  getAllOrdersWithAddress,
  updatePoojaBooking,
};