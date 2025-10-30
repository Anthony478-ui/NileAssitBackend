// backend/middleware/validation.js
const { body, validationResult } = require("express-validator");

const validateContactForm = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("businessType")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Business type must be at least 2 characters long"),

  body("service")
    .isIn(["admin", "social-media", "ecommerce", "research", "multiple"])
    .withMessage("Please select a valid service"),

  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = { validateContactForm };
