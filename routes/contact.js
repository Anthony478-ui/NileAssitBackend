// backend/routes/contact.js
const express = require("express");
const {
  submitContactForm,
  getContactRequests,
  updateContactStatus,
} = require("../controllers/contactController.js");
const { validateContactForm } = require("../middleware/validation.js");

const router = express.Router();

router.post("/submit", validateContactForm, submitContactForm);
router.get("/requests", getContactRequests);
router.patch("/requests/:id/status", updateContactStatus);

module.exports = router;
