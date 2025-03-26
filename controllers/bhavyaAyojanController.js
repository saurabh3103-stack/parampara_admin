const BhavyaAyojan = require('../models/bhavyaAyojanModel');


const generateNumericUUID = () => {
    const now = new Date();
    return now.toISOString().replace(/[-:.TZ]/g, '').slice(8, 14); // Extract HHMMSS
};

exports.createBhavyaAyojan = async (req, res) => {
    try {
        console.log(req.body);
        const {
            userId,
            full_name,
            email,
            phone_number,
            event_type,
            event_date,
            occasion,
            guest_count,
            venue,
            address,
            special_requirements
        } = req.body;

        const newBooking = new BhavyaAyojan({
            userId,
            bookingId: "BHAVYABOOK" + generateNumericUUID(),
            full_name,
            email,
            phone_number,
            event_type,
            event_date,
            occasion,
            guest_count,
            venue,
            address,
            special_requirements
        });

        await newBooking.save();
        res.status(201).json({ message: "Bhavya Ayojan Booking Saved", status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

exports.getBhavyaAyojan = async (req, res) => {
    try {
        const bookings = await BhavyaAyojan.find();
        if (bookings.length === 0) {
            return res.status(200).json({ message: "No Bookings Found", status: 0 });
        }
        res.status(200).json({ data: bookings, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};
exports.getBhavyaAyojanByUserID = async (req,res) =>{
    try{
        const {userId} = req.params;
        const booking = await BhavyaAyojan.find({"userId":userId});
        if(!booking){
            return res.status(200).json({message:"No Booking Found",})
        }
        res.status(200).json({data:booking,status:1});
    }catch(error){
        res.status(500).json({ message: error.message, status: 0 });
    }
}
exports.getBhavyaAyojanByID = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await BhavyaAyojan.findById(id);
        
        if (!booking) {
            return res.status(200).json({ message: "No Booking Found", status: 0 });
        }

        res.status(200).json({ data: booking, status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};

// Cancel a Bhavya Ayojan Booking by ID
exports.cancelBhavyaAyojanByID = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBooking = await BhavyaAyojan.findByIdAndUpdate(
            id,
            { status: 2 }, // Status 2 means Cancelled
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "No Booking Found", status: 0 });
        }

        res.status(200).json({ message: "Bhavya Ayojan Booking Cancelled", status: 1 });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 0 });
    }
};