const sdk = require("node-appwrite");
const client = new sdk.Client();
const databases = new sdk.Databases(client);
const users = new sdk.Users(client);
const dotenv = require("dotenv");

dotenv.config();

client
  .setEndpoint(process.env.END_POINT) // Your API Endpoint
  .setProject(process.env.PROJECT) // Your project ID
  .setKey(process.env.KEY);

module.exports = { client, databases, users, sdk };
