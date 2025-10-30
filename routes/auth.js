// backend/routes/auth.js
const express = require("express");
const {
  adminLogin,
  verifyAdmin,
  getAdminProfile,
  changePassword,
  initializeAdmin,
} = require("../controllers/authController.js");

const router = express.Router();

// Initialize admin on startup
initializeAdmin();

// Public routes
router.post("/login", adminLogin);

// Protected routes (require authentication)
router.get("/profile", verifyAdmin, getAdminProfile);
router.patch("/change-password", verifyAdmin, changePassword);

module.exports = router;
