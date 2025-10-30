// backend/controllers/serviceController.js
const { ID } = require("node-appwrite");
const { db } = require("../config/appwrite");
const { env } = require("../config/env");

const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const SERVICES_COLLECTION_ID = env.SERVICES_COLLECTION_ID;

// Sample services data - you can also store this in Appwrite
const defaultServices = [
  {
    id: "admin",
    title: "Admin Support",
    description:
      "Inbox management, data entry, scheduling, and calendar management to keep your business organized.",
    features: ["Email Management", "Data Entry", "Calendar Scheduling"],
    icon: "Mail",
  },
  {
    id: "social-media",
    title: "Social Media Assistance",
    description:
      "Content creation, post scheduling, engagement tracking, and social media strategy development.",
    features: ["Content Creation", "Post Scheduling", "Engagement Analytics"],
    icon: "Share2",
  },
  {
    id: "ecommerce",
    title: "E-Commerce Support",
    description:
      "Product listings, order tracking, customer messages, and inventory management for Nile Mart sellers.",
    features: ["Product Listings", "Order Tracking", "Customer Support"],
    icon: "ShoppingCart",
  },
  {
    id: "research",
    title: "Research & Reports",
    description:
      "Market insights, competitor analysis, data summaries, and comprehensive business reports.",
    features: ["Market Research", "Competitor Analysis", "Data Reports"],
    icon: "BarChart3",
  },
];

const getServices = async (req, res, next) => {
  try {
    // Try to get services from Appwrite first
    let services;
    try {
      const result = await db.listDocuments(
        DATABASE_ID,
        SERVICES_COLLECTION_ID
      );
      services = result.documents;
    } catch (error) {
      // If collection doesn't exist, use default services
      console.log("Services collection not found, using default services");
      services = defaultServices;
    }

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const {
      title,
      description,
      features,
      icon,
      category = "general",
    } = req.body;

    const serviceData = {
      title,
      description,
      features: Array.isArray(features) ? features : [features],
      category: category.toLowerCase(),
      icon,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.createDocument(
      DATABASE_ID,
      SERVICES_COLLECTION_ID,
      ID.unique(),
      serviceData
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    next(error);
  }
};

const getServiceCategories = async (req, res, next) => {
  try {
    const result = await db.listDocuments(DATABASE_ID, SERVICES_COLLECTION_ID);

    const categories = [
      "all",
      ...new Set(
        result.documents.map((service) => service.category).filter(Boolean)
      ),
    ];

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
};

module.exports = {
  getServices,
  createService,
  getServiceCategories,
};
