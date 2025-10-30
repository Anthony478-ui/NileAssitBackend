// backend/controllers/customQuoteController.js
const { ID } = require("node-appwrite");
const { db } = require("../config/appwrite");
const { env } = require("../config/env");
const { sendCustomQuoteNotification } = require("../utils/notifications");
const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const CUSTOM_QUOTES_COLLECTION_ID = env.CUSTOM_QUOTES_COLLECTION_ID;

const submitCustomQuote = async (req, res, next) => {
  try {
    const {
      name,
      email,
      company,
      businessType,
      budget,
      timeline,
      servicesNeeded,
      requirements,
      estimatedHours,
      preferredContact,
      urgency,
    } = req.body;

    const quoteData = {
      name,
      email,
      company: company || "",
      businessType: businessType || "",
      budget: budget || "",
      timeline: timeline || "",
      servicesNeeded: Array.isArray(servicesNeeded)
        ? servicesNeeded
        : [servicesNeeded],
      requirements: requirements || "",
      estimatedHours: estimatedHours || "",
      preferredContact: preferredContact || "email",
      urgency: urgency || "standard",
      status: "new",
      type: "custom_quote",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.createDocument(
      DATABASE_ID,
      CUSTOM_QUOTES_COLLECTION_ID,
      ID.unique(),
      quoteData
    );

    await sendCustomQuoteNotification(quoteData);

    res.status(201).json({
      success: true,
      message:
        "Custom quote request submitted successfully! We will contact you within 24 hours.",
      data: {
        id: result.$id,
        name: result.name,
        email: result.email,
      },
    });
  } catch (error) {
    console.error("Error submitting custom quote:", error);
    next(error);
  }
};

const getCustomQuotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let queries = [];
    if (status) {
      queries.push(`equal("status", "${status}")`);
    }

    const result = await db.listDocuments(
      DATABASE_ID,
      CUSTOM_QUOTES_COLLECTION_ID,
      queries.length > 0 ? queries : undefined
    );

    res.status(200).json({
      success: true,
      data: {
        quotes: result.documents,
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching custom quotes:", error);
    next(error);
  }
};

const getQuoteStats = async (req, res, next) => {
  try {
    const allQuotes = await db.listDocuments(
      DATABASE_ID,
      CUSTOM_QUOTES_COLLECTION_ID
    );

    const stats = {
      total: allQuotes.total,
      new: allQuotes.documents.filter((q) => q.status === "new").length,
      contacted: allQuotes.documents.filter((q) => q.status === "contacted")
        .length,
      quoted: allQuotes.documents.filter((q) => q.status === "quoted").length,
      negotiating: allQuotes.documents.filter((q) => q.status === "negotiating")
        .length,
      won: allQuotes.documents.filter((q) => q.status === "won").length,
      lost: allQuotes.documents.filter((q) => q.status === "lost").length,
      conversionRate: 0,
    };

    // Calculate conversion rate (won / total)
    if (allQuotes.total > 0) {
      stats.conversionRate = ((stats.won / allQuotes.total) * 100).toFixed(1);
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching quote stats:", error);
    next(error);
  }
};

const addQuoteNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const result = await db.updateDocument(
      DATABASE_ID,
      CUSTOM_QUOTES_COLLECTION_ID,
      id,
      {
        adminNotes,
        updatedAt: new Date().toISOString(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding quote notes:", error);
    next(error);
  }
};

const updateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = [
      "new",
      "contacted",
      "quoted",
      "negotiating",
      "won",
      "lost",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const result = await db.updateDocument(
      DATABASE_ID,
      CUSTOM_QUOTES_COLLECTION_ID,
      id,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Quote status updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating quote status:", error);
    next(error);
  }
};

module.exports = {
  submitCustomQuote,
  getCustomQuotes,
  getQuoteStats,
  addQuoteNotes,
  updateQuoteStatus,
};
