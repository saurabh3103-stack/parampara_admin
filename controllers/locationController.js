const location = require('../models/locationModel');

exports.createlocation = async (req, res) => {
    try {
      const newlocation = new location(req.body);
      await newlocation.save();
      res.status(201).json(newlocation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
exports.getlocation = async (req, res) => {
    try {
      const users = [
        {
          latitude: "28.7041", 
          longitude: "77.1025", 
          location: "Delhi, India", 
          area: "Connaught Place", 
          city: "Delhi", 
          state: "Delhi"
        },
        {
          latitude: "26.8467", 
          longitude: "80.9462", 
          location: "Kanpur, India", 
          area: "Mall Road", 
          city: "Kanpur", 
          state: "Uttar Pradesh"
        },
        {
          latitude: "28.6139", 
          longitude: "77.2090", 
          location: "New Delhi, India", 
          area: "Lajpat Nagar", 
          city: "Delhi", 
          state: "Delhi"
        }
      ];
      res.json(users);  
    } catch (error) {
      res.status(500).json({ message: error.message });  
    }
  };
  