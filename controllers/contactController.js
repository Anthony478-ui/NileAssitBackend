const { ID } = require("node-appwrite");

// backend/controllers/contactController.js

const { env } = require("../config/env");
const { db } = require("../config/appwrite");
const { sendNewContactNotification } = require("../utils/notifications");

const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const CONTACT_COLLECTION_ID = env.CONTACT_COLLECTION_ID;

const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, businessType, service, message } = req.body;

    const contactData = {
      name,
      email,
      businessType: businessType || "",
      service,
      message,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.createDocument(
      DATABASE_ID,
      CONTACT_COLLECTION_ID,
      ID.unique(),
      contactData
    );

    await sendNewContactNotification(contactData);

    res.status(201).json({
      success: true,
      message: "Contact request submitted successfully!",
      data: {
        id: result.$id,
        name: result.name,
        email: result.email,
        service: result.service,
      },
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    next(error);
  }
};

const getContactRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let queries = [];
    if (status) {
      queries.push(`equal("status", "${status}")`);
    }

    const result = await db.listDocuments(
      DATABASE_ID,
      CONTACT_COLLECTION_ID,
      queries.length > 0 ? queries : undefined
    );

    res.status(200).json({
      success: true,
      data: {
        contacts: result.documents,
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact requests:", error);
    next(error);
  }
};

const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "new",
      "contacted",
      "in-progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const result = await db.updateDocument(
      DATABASE_ID,
      CONTACT_COLLECTION_ID,
      id,
      {
        status,
        updatedAt: new Date().toISOString(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    next(error);
  }
};

module.exports = {
  submitContactForm,
  getContactRequests,
  updateContactStatus,
};
