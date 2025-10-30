// backend/controllers/pricingController.js
const { ID } = require("node-appwrite");
const { db } = require("../config/appwrite");
const { env } = require("../config/env");

const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const PRICING_COLLECTION_ID = env.PRICING_COLLECTION_ID;

const getPricingPlans = async (req, res, next) => {
  try {
    const result = await db.listDocuments(DATABASE_ID, PRICING_COLLECTION_ID, [
      'orderAsc("order")', // Sort by order field
    ]);

    res.status(200).json({
      success: true,
      data: result.documents,
    });
  } catch (error) {
    console.error("Error fetching pricing plans:", error);

    // Fallback to default plans if collection doesn't exist
    const defaultPlans = getDefaultPricingPlans();
    res.status(200).json({
      success: true,
      data: defaultPlans,
      usingFallback: true,
    });
  }
};

const createPricingPlan = async (req, res, next) => {
  try {
    const {
      name,
      hours,
      price,
      period,
      popular,
      features,
      order,
      isActive = true,
    } = req.body;

    const planData = {
      name,
      hours,
      price,
      period,
      popular: Boolean(popular),
      features: Array.isArray(features) ? features : [features],
      order: order || 0,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.createDocument(
      DATABASE_ID,
      PRICING_COLLECTION_ID,
      ID.unique(),
      planData
    );

    res.status(201).json({
      success: true,
      message: "Pricing plan created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    next(error);
  }
};

const updatePricingPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await db.updateDocument(
      DATABASE_ID,
      PRICING_COLLECTION_ID,
      id,
      {
        ...updateData,
        updatedAt: new Date().toISOString(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Pricing plan updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating pricing plan:", error);
    next(error);
  }
};

// Default plans if database is not set up
const getDefaultPricingPlans = () => [
  {
    id: "starter",
    name: "Starter Plan",
    hours: "10 hrs/week",
    price: "Ksh 2500",
    period: "month",
    popular: false,
    order: 1,
    isActive: true,
    features: [
      "1 dedicated VA",
      "Email support",
      "Basic admin tasks",
      "5-day work week",
      "Monthly progress report",
    ],
  },
  {
    id: "growth",
    name: "Growth Plan",
    hours: "20 hrs/week",
    price: "Ksh 5000",
    period: "month",
    popular: true,
    order: 2,
    isActive: true,
    features: [
      "1-2 dedicated VAs",
      "Priority support",
      "Advanced tasks included",
      "6-day work week",
      "Weekly progress reports",
      "Social media support",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    hours: "40 hrs/week",
    price: "Ksh 6000",
    period: "month",
    popular: false,
    order: 3,
    isActive: true,
    features: [
      "Dedicated VA team",
      "24/7 emergency support",
      "All services included",
      "7-day work week",
      "Daily progress updates",
      "Custom reporting",
      "Strategic consulting",
    ],
  },
];

module.exports = {
  getPricingPlans,
  createPricingPlan,
  updatePricingPlan,
};
