// backend/checkAdmin.js
const dotenv = require("dotenv");
const { Client, Databases } = require("node-appwrite");
const { env } = require("./config/env");

dotenv.config();

const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

const databases = new Databases(client);

const checkAdmin = async () => {
  try {
    console.log("🔍 Checking admin setup...");

    // Check if collection exists
    try {
      await databases.getCollection(env.APPWRITE_DATABASE_ID, "admins");
      console.log("✅ Admin collection exists");
    } catch (error) {
      console.log("❌ Admin collection does not exist");
      console.log('Please create "admins" collection in Appwrite');
      return;
    }

    // Check if admin documents exist
    const admins = await databases.listDocuments(
      env.APPWRITE_DATABASE_ID,
      env.ADMIN_COLLECTION_ID
    );

    console.log(`📊 Total admin documents: ${admins.total}`);

    admins.documents.forEach((admin, index) => {
      console.log(`\n👤 Admin ${index + 1}:`);
      console.log(`   ID: ${admin.$id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   isActive: ${admin.isActive}`);
      console.log(`   Password length: ${admin.password?.length || "missing"}`);
    });

    if (admins.total === 0) {
      console.log("\n❌ No admin documents found. Creating one now...");
      await createAdmin();
    }
  } catch (error) {
    console.error("❌ Error checking admin:", error.message);
  }
};

const createAdmin = async () => {
  try {
    const bcrypt = await import("bcryptjs");
    const { ID } = await import("node-appwrite");

    const hashedPassword = await bcrypt.default.hash("admin123", 12);

    const adminData = {
      email: "admin@nileassist.com",
      password: hashedPassword,
      name: "Nile Assist Admin",
      role: "super_admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      "admins",
      ID.unique(),
      adminData
    );

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@nileassist.com");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

checkAdmin();
