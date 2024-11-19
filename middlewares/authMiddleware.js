const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const SECRET = process.env.JWT_SECRET || "superSuperSecret"; // Use environment variable for the secret key

const authenticateToken = (req, res, next) => {
  // Retrieve token from multiple possible sources
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    (req.header("Authorization") && req.header("Authorization").split(" ")[1]);

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    console.log("Token received: ", token); // Log token for debugging
    console.log("Using secret: ", SECRET); // Debug: Verify the secret being used

    // Decode and verify the token using the secret key
    const decode = jwt.sign(token, SECRET);

    const decoded = jwt.verify(decode, SECRET);
    console.log("Decoded token: ", decoded); // Log decoded information
    req.user = decoded; // Attach decoded user info to the request object
    next(); // Call the next middleware or route handler
  } catch (err) {
    console.error("JWT Error: ", err.message); // Log specific error for debugging
    return res.status(400).json({
      success: false,
      message: "Invalid token",
      error: err.message,
    });
  }
};

module.exports = authenticateToken;
