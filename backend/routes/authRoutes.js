
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later."
  }
});
const passwordResetAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later."
  }
});

// Student registration
router.post("/register", authController.register);

// Student login
router.post("/login", authController.login);

router.post(
  "/forgot-password",
  passwordResetRequestLimiter,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  passwordResetAttemptLimiter,
  authController.resetPassword
);
router.post("/change-password", protect, authController.changePassword);

module.exports = router;
