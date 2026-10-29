
const bcrypt = require("bcryptjs");
const { createHash, randomBytes } = require("node:crypto");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const passwordResetMailer = require("../services/passwordResetMailer");

const PASSWORD_RESET_MESSAGE =
  "If an account with that email exists, password reset instructions will be sent.";
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function authVersionFilter(authVersion) {
  if (authVersion === 0) {
    return {
      $or: [
        { authVersion: 0 },
        { authVersion: { $exists: false } }
      ]
    };
  }

  return { authVersion };
}

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

    // Public registration always creates a student account.
    // Never accept the role from req.body.
    const student = await Student.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      department: department.trim(),
      course: course.trim(),
      role: "student"
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        course: student.course,
        role: student.role
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

    // Include the role stored in the database in the signed JWT.
    const token = jwt.sign(
      {
        id: student._id.toString(),
        email: student.email,
        role: student.role || "student",
        authVersion: student.authVersion || 0
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
        course: student.course,
        role: student.role || "student"
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body || {};

  if (typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address."
    });
  }

  if (!passwordResetMailer.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: "Password reset is temporarily unavailable."
    });
  }

  try {
    const student = await Student.findOne({
      email: email.trim().toLowerCase()
    });

    if (student) {
      const resetToken = randomBytes(32).toString("hex");
      const resetTokenHash = hashResetToken(resetToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await Student.updateOne(
        { _id: student._id },
        {
          $set: {
            passwordResetTokenHash: resetTokenHash,
            passwordResetExpires: expiresAt
          }
        }
      );

      try {
        await passwordResetMailer.sendPasswordResetEmail(
          student.email,
          resetToken
        );
      } catch {
        console.error("Password reset email delivery failed.");
        try {
          await Student.updateOne(
            { _id: student._id, passwordResetTokenHash: resetTokenHash },
            {
              $unset: {
                passwordResetTokenHash: "",
                passwordResetExpires: ""
              }
            }
          );
        } catch {
          console.error("Could not invalidate the undelivered password reset token.");
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: PASSWORD_RESET_MESSAGE
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body || {};

  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token) ||
    typeof newPassword !== "string" ||
    newPassword.length < 8
  ) {
    return res.status(400).json({
      success: false,
      message:
        typeof newPassword !== "string" || newPassword.length < 8
          ? "Password must contain at least 8 characters."
          : "Invalid or expired password reset token."
    });
  }

  try {
    const tokenHash = hashResetToken(token);
    const validReset = await Student.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!validReset) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedStudent = await Student.findOneAndUpdate(
      {
        _id: validReset._id,
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: new Date() }
      },
      {
        $set: { password: hashedPassword },
        $unset: {
          passwordResetTokenHash: "",
          passwordResetExpires: ""
        },
        $inc: { authVersion: 1 }
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please sign in again."
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body || {};

  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide your current password."
    });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters."
    });
  }

  try {
    const student = await Student.findById(req.user.id).select("+password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      student.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedStudent = await Student.findOneAndUpdate(
      {
        _id: student._id,
        ...authVersionFilter(req.user.authVersion)
      },
      {
        $set: { password: hashedPassword },
        $unset: {
          passwordResetTokenHash: "",
          passwordResetExpires: ""
        },
        $inc: { authVersion: 1 }
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please sign in again."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword
};
