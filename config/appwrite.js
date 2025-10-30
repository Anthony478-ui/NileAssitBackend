// backend/config/appwrite.js
const {
  Client,
  Account,
  Databases,
  Users,
  Functions,
  Storage,
} = require("node-appwrite");
const { env } = require("./env");
const { Avatars } = require("node-appwrite");

const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

module.exports.account = new Account(client);
module.exports.db = new Databases(client);
module.exports.users = new Users(client);
module.exports.avatars = new Avatars(client);
module.exports.functions = new Functions(client);
module.exports.storage = new Storage(client);
