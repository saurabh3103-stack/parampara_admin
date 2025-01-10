const Pandit = require('../models/panditModel');

exports.getPanditsInRange = async (req, res) => {
  try {
    const { userLat, userLon } = req.body;

    if (!userLat || !userLon) {
      return res.status(400).json({ message: 'Latitude and Longitude are required.', status: 0 });
    }

    // Function to calculate distance using the Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in kilometers
    };

    // Fetch all Pandits from the database
    const pandits = await Pandit.find({});

    // Filter Pandits within 2km range
    const nearbyPandits = pandits.filter(pandit => {
      const distance = calculateDistance(userLat, userLon, pandit.latitude, pandit.longitude);
      return distance <= 2;
    });

    if (nearbyPandits.length === 0) {
      return res.status(200).json({ message: 'No nearby Pandits found.', data: [],status: 1 });
    }

    res.status(200).json({ message: 'Nearby Pandits', data: nearbyPandits, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
