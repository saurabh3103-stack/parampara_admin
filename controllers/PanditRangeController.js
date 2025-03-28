const Pandit = require('../models/panditModel');

exports.getPanditsInRange = async (req, res) => {
  console.log(req.body);
  try {
    const { userLat, userLon } = req.body;
    if (!userLat || !userLon) {
      return res.status(400).json({ message: 'Latitude and Longitude are required.', status: 0 });
    }

    // Helper function to calculate distance between two coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of Earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 1000) / 1000; // Distance in km
    };

    const pandits = await Pandit.find({});
    const nearbyPandits = pandits.filter(pandit => {
      const distance = calculateDistance(userLat, userLon, pandit.latitude, pandit.longitude);
      console.log(distance);
      // console.log(`Distance to Pandit (${pandit.name || 'unknown'}): ${distance} km`);
      return distance <= 50000;
    });
    console.log(nearbyPandits);
    if (nearbyPandits.length === 0) {
      return res.status(200).json({ message: 'No nearby Pandits found.', data: 0, status: 0 });
    }

    res.status(200).json({ message: 'Nearby Pandits', data: nearbyPandits, status: 1 });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message, status: 0 });
  }
};
