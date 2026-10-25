
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

// Register a student
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, course } = req.body;

    if (!name || !email || !password || !department || !course) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields."
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingStudent = await Student.findOne({
      email: normalizedEmail
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await Student.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      department: department.trim(),
      course: course.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        course: student.course
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    next(error);
  }
};

// Log in a student and issue a JWT
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password."
      });
    }

    const student = await Student.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured on the server."
      });
    }

    const token = jwt.sign(
      {
        id: student._id.toString(),
        email: student.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        issuer: "student-course-management"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        course: student.course
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
