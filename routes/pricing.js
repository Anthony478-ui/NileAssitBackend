// backend/routes/pricing.js
const express = require("express");
const {
  getPricingPlans,
  createPricingPlan,
  updatePricingPlan,
} = require("../controllers/pricingController");
// Assuming you have an authController with a verifyAdmin middleware
const { verifyAdmin } = require("../controllers/authController");

const router = express.Router();

// Public route - anyone can view pricing
router.get("/getpricing", getPricingPlans);

// Protected routes - only admins can modify pricing
router.post("/create", verifyAdmin, createPricingPlan);
router.patch("/:id", verifyAdmin, updatePricingPlan);

module.exports = router;
