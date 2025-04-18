const mongoose = require("mongoose");

const paramarshaRequestSchema = new mongoose.Schema({
    userName: { type: String },
    userID: { type: String },
    category: {type:String},
    dob: { type: Date },
    timeofBirth: { type: String },
    gender: { type: String },
    placeofBirth: { type: String },
    contact_no: { type: String },
    email: { type: String },
    question: { type: String },
    description: { type: String, default: null },
    preferedTiming: { type: String },
    callOption: { type: String },
    paymentAmmount: { type: String },
    paymentStatus: { type: String, default: null },
    transcationId: { type: String, default: null },
    transcationDate: { type: Date, default: null },
    assignPanditStatus: { type: String, default: "0" },
    paditId: { type: String, default: null },
    status: { type: String, default: "1" },
    created_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ParamarshaRequest", paramarshaRequestSchema);
