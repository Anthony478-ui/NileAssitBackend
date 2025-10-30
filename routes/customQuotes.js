// backend/routes/customQuotes.js
const express = require("express");
const {
  submitCustomQuote,
  getCustomQuotes,
  getQuoteStats,
  updateQuoteStatus,
  addQuoteNotes,
} = require("../controllers/customQuoteController");
const { env } = require("../config/env");
const { verifyAdmin } = require("../controllers/authController");

const router = express.Router();

// Public route - anyone can submit custom quote
router.post("/submit", submitCustomQuote);

// Protected routes - only admins can view quotes
router.get("/", verifyAdmin, getCustomQuotes);
router.get("/stats", verifyAdmin, getQuoteStats);
router.patch("/:id/status", verifyAdmin, updateQuoteStatus);
router.patch("/:id/notes", verifyAdmin, addQuoteNotes);

module.exports = router;
