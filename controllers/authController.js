// backend/controllers/authController.js
const { db } = require("../config/appwrite");
const { databases, ID, Query } = require("node-appwrite");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const DATABASE_ID = env.APPWRITE_DATABASE_ID;
const ADMIN_COLLECTION_ID = env.ADMIN_COLLECTION_ID; // We'll create this collection
const JWT_SECRET = env.JWT_SECRET || "nile-assist-admin-secret-key-2024";
const JWT_EXPIRES_IN = "24h";

// Initialize admin user if not exists
const initializeAdmin = async () => {
  try {
    // Check if admin collection exists and has users
    const existingAdmins = await db.listDocuments(
      DATABASE_ID,
      ADMIN_COLLECTION_ID,
      [Query.equal("email", "admin@nileassist.com")]
    );

    if (existingAdmins.total === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 12);

      const adminData = {
        email: "admin@nileassist.com",
        password: hashedPassword,
        name: "Nile Assist Admin",
        role: "super_admin",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };

      await db.createDocument(
        DATABASE_ID,
        ADMIN_COLLECTION_ID,
        ID.unique(),
        adminData
      );

      console.log("✅ Default admin user created");
    }
  } catch (error) {
    // If collection doesn't exist, we'll create it when needed
    console.log("Admin collection not initialized yet");
  }
};

// Admin login
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email
    let admin;
    try {
      const result = await db.listDocuments(DATABASE_ID, ADMIN_COLLECTION_ID, [
        Query.equal("email", email),
      ]);

      if (result.total === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      admin = result.documents[0];
    } catch (error) {
      // If collection doesn't exist, create it and initialize admin
      if (error.code === 404) {
        await createAdminCollection();
        await initializeAdmin();

        // Try to find admin again
        const result = await db.listDocuments(
          DATABASE_ID,
          ADMIN_COLLECTION_ID,
          [Query.equal("email", email)]
        );

        if (result.total === 0) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        admin = result.documents[0];
      } else {
        throw error;
      }
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    console.log("Admin found. Checking password...");
    console.log("Input password:", password);
    console.log("Stored hash:", admin.password);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.$id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login
    await db.updateDocument(DATABASE_ID, ADMIN_COLLECTION_ID, admin.$id, {
      lastLogin: new Date().toISOString(),
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          id: admin.$id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

// Verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify admin still exists and is active
    const admin = await db.getDocument(
      DATABASE_ID,
      ADMIN_COLLECTION_ID,
      decoded.id
    );

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await db.getDocument(
      DATABASE_ID,
      ADMIN_COLLECTION_ID,
      req.admin.id
    );

    res.status(200).json({
      success: true,
      data: {
        id: admin.$id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    next(error);
  }
};

// Change admin password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get admin
    const admin = await db.getDocument(
      DATABASE_ID,
      ADMIN_COLLECTION_ID,
      req.admin.id
    );

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.updateDocument(DATABASE_ID, ADMIN_COLLECTION_ID, req.admin.id, {
      password: hashedNewPassword,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};

// Helper function to create admin collection
const createAdminCollection = async () => {
  // In a real implementation, you'd create the collection programmatically
  // For now, we'll assume it's created manually in Appwrite
  console.log(
    'Please create "admins" collection in Appwrite with the following attributes:'
  );
  console.log("- email: string, required");
  console.log("- password: string, required");
  console.log("- name: string, required");
  console.log("- role: string, required");
  console.log("- isActive: boolean, required");
  console.log("- lastLogin: string");
  console.log("- createdAt: string, required");
  console.log("- updatedAt: string");
};

module.exports = {
  adminLogin,
  verifyAdmin,
  getAdminProfile,
  changePassword,
  initializeAdmin,
};
