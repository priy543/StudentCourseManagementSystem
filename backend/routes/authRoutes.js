
const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Student registration
router.post("/register", authController.register);

// Student login
router.post("/login", authController.login);

module.exports = router;
