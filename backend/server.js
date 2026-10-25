
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

const connectDB = require("./config/db");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");

const notFoundHandler = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Authentication routes
app.use("/api/v1/auth", authRoutes);

// Course routes
app.use("/api/v1/courses", courseRoutes);

// Root test route
app.get("/", (req, res) => {
  res.json({
    message: "Student Course Management Backend is running!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is healthy"
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
