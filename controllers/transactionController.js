// controllers/TransactionController.js
const Transaction = require('../models/transaction'); // Path to the Transaction model
const { v4: uuidv4 } = require("uuid");

const generateNumericUUID = () => {
    const uuid = uuidv4().replace(/-/g, ''); // Remove hyphens
    const numericId = uuid.split('').map(char => char.charCodeAt(0) % 10).join(''); // Convert each character to a number
    return numericId;
  };
  
const createTransaction = async (req, res) => {
    console.log(req.body);
    try {
        const {
            userId,
            orderId,
            productType,
            paymentMethod,
            amount,
            transactionStatus,
        } = req.body;
        const transactionId = generateNumericUUID();
        // Create a new transaction
        const newTransaction = new Transaction({
            userId,
            orderId,
            productType,
            paymentMethod,
            transactionId,
            amount,
            transactionStatus: transactionStatus || 'pending', // Default to 'pending'
        });

        // Save the transaction to the database
        await newTransaction.save();
        console.log(newTransaction);

        // Respond with the created transaction details
        res.status(201).json({
            message: "Transaction created successfully",
            transaction: newTransaction,
            status: 1,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Error creating transaction",
            error: error.message,
            status: 0,
        });
    }
};

module.exports = { createTransaction };
