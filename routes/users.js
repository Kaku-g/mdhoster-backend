const router = require("express").Router();
const { oauthAuthorizationUrl } = require("@octokit/oauth-authorization-url");
const url = require("url");
const dotenv = require("dotenv");
const { OAuthApp } = require("@octokit/oauth-app");
const { octokit } = require("@octokit/rest");
const { Appwrite, Client, Account, ID } = require("appwrite");
const { client, databases, users, sdk } = require("../utility/appwriteconfig");
const axios = require("axios");

dotenv.config();

const appwriteClient = new Client()
  .setEndpoint(process.env.END_POINT)
  .setProject(process.env.PROJECT_ID);

const clientId = process.env.CLIENT_ID;
const redirectUri = process.env.REDIRECT_URL;
const scope = process.env.SCOPE;
const client_secret = process.env.CLIENT_SECRET;
const database_id = process.env.DB_ID;
const app_id = process.env.APP_ID;

const app = new OAuthApp({
  clientType: "oauth-app",
  clientId: clientId,
  clientSecret: client_secret,
});

router.get("/login", async (req, res) => {
  try {
    const { url } = oauthAuthorizationUrl({
      clientType: "oauth-app",
      clientId: clientId,
      redirectUrl: redirectUri,
      login: "octocat",
      scopes: ["repo"],
      state: process.env.GITHUB_STATE_SECRET,
    });
    res.send(url);
  } catch (error) {
    console.log(error);
  }
});

//fething the desired repo

router.post("/user/:userName/:repo/:path", async (req, res) => {
  try {
    //check if docuemnt exists

    // appwriteClient.getDocument(process.env.DOCUMENT_ID);

    const owner = req.params.userName;
    const repo = req.params.repo;
    const path = req.params.path;
    console.log(path);

    octokit.rest.repos
      .getContent({
        owner: owner,
        repo: repo,
        path: path,
      })
      .then((response) => {
        const content = Buffer.from(response.data.content, "base64").toString(
          "utf-8"
        );
        console.log(content);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
});

router.get("/token/:code", async (req, res) => {
  try {
    let userFound = 0;
    //  const parsedUrl = url.parse(req.url, true);
    //const queryPar = parsedUrl.query;
    // const code = queryPar.code;
    const code = req.params.code;
    const response = await app.createToken({
      code: code,
    });
    const token = response.authentication.token;

    axios
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })
      .then(async (response) => {
        //CREATE USER IN APPWRITE DB
        console.log(response.data);
        let user = response.data.login;

        //res.send(response.data);

        // let userFound = 0;

        const userResponse = await users.list();
        console.log(userResponse);
        if (userResponse.total) {
          userResponse.users.map((el) => {
            console.log(el.$id);
            if (el.$id == response.data.login) {
              userFound = 1;
              console.log("found");
              return;
            }
          });
        }

        //console.log(userFound);

        if (!userFound) {
          users.create(user).then((response) => {
            databases.createCollection(database_id, user, user);
            const data = {
              user: user,
              token: token,
            };
            res.send(data);
          });
        } else {
          const sendUser = async (response) => {
            //console.log(response.$id, user);

            if (response.$id) {
              const data = {
                user: response.$id,
                token: token,
              };
              res.send(data);
            }
          };
          const userCheck = await users.get(user);
          sendUser(userCheck);
        }
      });
  } catch (error) {
    console.log(error);
  }
});

router.post("login");

module.exports = router;
