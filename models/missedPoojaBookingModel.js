const mongoose = require('mongoose');

const missedPoojaBookingSchema = new mongoose.Schema({
    pandit_id:{
        type : mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Pandit_table",
    },
    isAutomatic:{
        type:String,
        default:1, // 1 for automatic rejeectd, 0 for rejected by pandit 
    },
    bookingDetails: {
        poojaId: {
          type: String,
          required: true,
        },
        poojaName: {
          type: String,
          required: true,
        },
        Type: {
          type: String,
          required: true, 
        },
        isSamagriIncluded: {
          type: Boolean,
          required: true,
        },
    },
    schedule: {
        date: {
          type: String, // Stored as a string (e.g., "2025-01-10")
          default: null,
        },
        time: {
          type: String, // Stored as a string (e.g., "10:30 AM")
          default: null,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },    
})

module.exports = mongoose.model("missedPoojaBooking",missedPoojaBookingSchema);