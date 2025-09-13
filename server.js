import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";

// Routes
import propertiesRoutes from "./routes/properties.js";
import contactRoutes from "./routes/contact.js";
import adminRoutes from "./routes/admin.js";
import wishlistRoutes from "./routes/wishlist.js";
import partnersRoutes from "./routes/partners.js"; // 👈 NEW (real DB)
import blogsRoutes from "./routes/blogs.js";
import testimonialsRoutes from "./routes/testimonials.js";

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then((dbConnected) => {
  console.log(
    dbConnected
      ? "✅ Connected to MongoDB"
      : "⚠️ Using mock data - some features may be limited"
  );
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3002", // frontend origin allow karo
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    credentials: true,
  })
);

// Disable cache
app.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
  });
  next();
});

app.use(morgan("combined")); // Logging
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Real Routes
app.use("/api/properties", propertiesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/partners", partnersRoutes); // 👈 Now connected with MongoDB
app.use("/api/blogs", blogsRoutes);
app.use("/api/testimonials", testimonialsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AMZ Properties API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to AMZ Properties API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      properties: "/api/properties",
      contact: "/api/contact",
      wishlist: "/api/wishlist",
      admin: "/api/admin",
      partners: "/api/partners",
      blogs: "/api/blogs",
      testimonials: "/api/testimonials",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AMZ Properties API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/`);
});

export default app;