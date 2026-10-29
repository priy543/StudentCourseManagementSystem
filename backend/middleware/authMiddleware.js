
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const protect = async (req, res, next) => {
  let decoded;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please provide a valid token."
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is missing."
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured on the server."
      });
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "student-course-management"
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }

  if (typeof decoded.id !== "string") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }

  try {
    const student = await Student.findById(decoded.id).select(
      "email role authVersion"
    );
    const authVersion = student?.authVersion || 0;
    const tokenVersion = decoded.authVersion || 0;

    if (!student || tokenVersion !== authVersion) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token."
      });
    }

    req.user = {
      id: student._id.toString(),
      email: student.email,
      role: student.role || "student",
      authVersion
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { protect };
