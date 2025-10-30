// backend/routes/services.js
const express = require("express");
const {
  getServices,
  createService,
  getServiceCategories,
} = require("../controllers/serviceController.js");

const router = express.Router();

router.get("/", getServices);
router.post("/create", createService);
router.get("/categories", getServiceCategories);

module.exports = router;
