const express = require("express");
const router = require("express").Router();
const url = require("url");

const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
// const { Octokit } = require("@octokit/core");
const { Octokit } = require("@octokit/rest");

dotenv.config();
// const owner = "Kaku-g";
// const repo = "Kaku-g";
// const filePath = "README.md";
// const clientId = "Iv1.6ae97f60c7bb832a";
// const redirectUri = "http://localhost:5000/token";
// const scope = "repo";

app.use(express.json());
app.use(cors());

// Route
const PORT = process.env.PORT || 5000;
app.use("/", require("./routes/users"));
app.use("/user/", require("./routes/appwrite"));

app.listen(PORT, () => console.log("Server is running"));
