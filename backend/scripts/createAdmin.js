const path = require("node:path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const Student = require("../models/Student");

async function createAdmin() {
  const mongoUri = process.env.MONGO_URI;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!mongoUri || !adminEmail || !adminPassword) {
    console.error(
      "MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured."
    );
    process.exitCode = 1;
    return;
  }

  if (adminPassword.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters long.");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(mongoUri);

    const existingStudent = await Student.findOne({ email: adminEmail }).select(
      "_id"
    );

    if (existingStudent) {
      console.log(
        "An account with this email already exists. No changes were made."
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await Student.create({
      name: "Administrator",
      email: adminEmail,
      password: hashedPassword,
      department: "Administration",
      course: "Administration",
      role: "admin"
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    if (error.code === 11000) {
      console.error(
        "An account with this email already exists. No existing account was modified."
      );
    } else {
      console.error(
        "Admin account setup failed. Check backend configuration and MongoDB connectivity."
      );
    }

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin().catch((_error) => {
  console.error(
    "Admin account setup failed. Check backend configuration and MongoDB connectivity."
  );
  process.exitCode = 1;
});
