// backend/server.js
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

// Debug: Check if environment variables are loaded
console.log("🔧 Environment Check:");
console.log(
  "APPWRITE_ENDPOINT:",
  process.env.APPWRITE_ENDPOINT ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "APPWRITE_PROJECT_ID:",
  process.env.APPWRITE_PROJECT_ID ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "APPWRITE_API_KEY:",
  process.env.APPWRITE_API_KEY ? "✅ Loaded" : "❌ Missing"
);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const contactRoutes = require("./routes/contact.js");
const serviceRoutes = require("./routes/services.js");
const authRoutes = require("./routes/auth.js");
const pricingRoutes = require("./routes/pricing.js");
const customQuoteRoutes = require("./routes/customQuotes.js");
const { notFound, errorHandler } = require("./middleware/errorHandler.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS Origin: ", origin); // ✅ See what origin is received
    // 🚨 IMPORTANT: Use the CLIENT_URL environment variable here
    const clientUrl = process.env.CLIENT_URL;
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",

      "http://localhost:3000", // Add if you have frontend dev server on 3000

      "https://nileassitbackend.onrender.com",
      "https://nileassisst.onrender.com",
      "https://nileassitadmin.onrender.com",
    ];

    // Add the clientUrl if it's set and not already in the list
    if (clientUrl && !allowedOrigins.includes(clientUrl)) {
      allowedOrigins.push(clientUrl);
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nile Assist API is running smoothly!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Add to your backend routes
app.get("/api/admin/stats", async (req, res) => {
  try {
    // Get counts from database
    const [contacts, services] = await Promise.all([
      databases.listDocuments(env.DATABASE_ID, CONTACT_COLLECTION_ID),
      databases.listDocuments(env.DATABASE_ID, SERVICES_COLLECTION_ID),
    ]);

    const stats = {
      totalContacts: contacts.total,
      newContacts: contacts.documents.filter((c) => c.status === "new").length,
      totalServices: services.total,
      conversionRate: "12%", // Calculate based on your business logic
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Routes
app.use("/api/contact", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/custom-quotes", customQuoteRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Nile Assist backend running on port http://0.0.0.0:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
  console.log(`🗄️  Appwrite Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
});
