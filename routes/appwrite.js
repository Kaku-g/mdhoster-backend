const sdk = require("node-appwrite");
const router = require("express").Router();

const dotenv = require("dotenv");
const axios = require("axios");
const { Octokit } = require("@octokit/rest");

dotenv.config();

// Init SDK
const client = new sdk.Client();
const databases = new sdk.Databases(client);
//const ID=new sdk.ID()

const users = new sdk.Users(client);
const database_id = process.env.DB_ID;

client
  .setEndpoint(process.env.END_POINT) // Your API Endpoint
  .setProject(process.env.PROJECT) // Your project ID
  .setKey(
   process.env.KEY
  ); // Your secret API key

const createDocument = async (userName, code, attributes, repoName, res) => {
  //let code = code;
  // const mainCreateDocument = (userName, code, repoName) => {

  // };
  try {
    // const promiseCollection = await databases.listCollections(database_id);
    // promiseCollection.collections.map((el) => {
    //   if (el.name == userName) {
    //     throw "exit";
    //   }
    // });
    // let promise1 = databases.createCollection(
    //   database_id,
    //   sdk.ID.unique(),
    //   userName
    // );
    let attributeExist = 0;
    let attribute1promise = 0;
    let attribute2promise = 0;
    let attribute3promise = 0;
    let promise1 = databases.getCollection(database_id, userName);
    //  console.log(promise1);
    promise1
      .then(
        async function (response) {
          console.log(response);
          //attributeExist=0;
          //check if attribute already exists
          let checkAttributeExist = await databases.listAttributes(
            database_id,
            userName
          );
          //  console.log(checkAttributeExist);

          if (checkAttributeExist.total) {
            checkAttributeExist.attributes.map((el) => {
              if (el.key == attributes[0]) {
                attributeExist = 1;
                return;
              }
            });
          }

          if (!attributeExist) {
            attributes.map(async (el) => {
              await databases.createStringAttribute(
                database_id,
                response.$id,
                el,
                5000,
                true
              );
            });
            // p1 = await databases.createStringAttribute(
            //   database_id,
            //   response.$id,
            //   attribute,
            //   5000,
            //   true
            // );
            //let nameAttribute= await data
          }

          const promise = await databases.listDocuments(database_id, userName);
          //console.log(promise);
          const desiredRepo = await promise.documents.filter((el) => {
            return el.repo == repoName;
          });

          if (desiredRepo.length) {
            console.log(desiredRepo);
            res.send("ended");
            return;
          }

          const clearTimeout = async (attributes) => {
            // clearInterval(intervalId);

            // const getDocs = async (user, repo) => {

            // const { code, link } = desiredRepo[0];
            // console.log(link, code);
            // const data = { link, code };
            // res.send(data);
            // };

            //getDocs(userName, repoName);
            p2 = await databases.createDocument(
              database_id,
              userName,
              sdk.ID.unique(),
              {
                [`${attributes[0]}`]: code,
                [`${attributes[1]}`]: repoName,
                [`${attributes[2]}`]: `${process.env.APP_URL}/${userName}/${repoName}`,
              }
            );
            return 1;
          };

          const checkAttribute = async () => {
            // attribute1promise = await databases.getAttribute(
            //   database_id,
            //   userName,
            //   attributes[0]
            // );

            // attribute2promise = await databases.getAttribute(
            //   database_id,
            //   userName,
            //   attributes[1]
            // );
            attribute3promise = await databases.getAttribute(
              database_id,
              userName,
              attributes[2]
            );
            if (
              // attribute1promise.status == "available" &&
              // attribute2promise.status == "available" &&
              attribute3promise.status == "available"
            ) {
              console.log(attribute3promise.status);
              // clearInterval(intervalId);
              stopInterval();
              clearTimeout(attributes);
              console.log("ended");
              res.send("ended");

              //res.send();
            } else {
              //  console.log(promise.status);
              // console.log(promise);
              return;
            }
          };
          const intervalId = setInterval(checkAttribute, 5000);
          const stopInterval = () => {
            clearInterval(intervalId);
          };

          //await delay(2000);
        },
        function (error) {
          console.log(error);
        }
      )
      .then(
        function (response) {
          console.log(response);
          //return `localhost:3000/${userName}/repos/${repoName}`;
        },
        function (error) {
          console.log(error);
        }
      );

    // mainCreateDocument(userName, code, repoName);
  } catch (error) {
    console.log(error);
  }
};

router.get("/:user/:token/:repo/:path", (req, res) => {
  try {
    const user = req.params.user;
    const token = req.params.token;
    const repo = req.params.repo;
    const path = req.params.path;

    const octokit = new Octokit({
      auth: token,
    });

    octokit.rest.repos
      .getContent({
        owner: user,
        repo: repo,
        path: path,
      })
      .then(async (response) => {
        const content = Buffer.from(response.data.content, "base64").toString(
          "utf-8"
        );
        await createDocument(
          user,
          content,
          ["code", "repo", "link"],
          repo,
          res
        );
        // if (createDocument) res.send("cretaed");
        //res.send("created");
        // console.log(content);
        //   res.send({ created: content });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:user", (req, res) => {
  try {
    const user = req.params.user;
    // const getDocument = async (userName) => {
    //list collections
    // function isUsersDocument(el) {
    //   if (el.name == userName) return true;
    //   else return false;
    // }
    // const promise1 = await databases.listCollections(database_id);
    // // //console.log(promise1);

    // const userDoc = promise1.collections.filter(isUsersDocument);
    // // // console.log(userDoc);
    // const collectionId = userName;
    // res.send(collectionId);
    // console.log(collectionId);
    //console.log(collectionId);
    //  res.send(collectionId);

    const promise2 = databases.listDocuments(database_id, user);
    promise2.then((response) => {
      if (response.documents.length) {
        res.send(response.documents);
      } else {
        res.send("null");
      }
    });
    //promise2 is an array
    // console.log(promise2);
    //checking length if document  exits

    //console.log(promise2.documents);
    // res.send(promise2.documents[0]);

    //console.log(promise2);
    // };

    // getDocument(user);
  } catch (error) {
    console.log(error);
  }
});

//list documents for getting data for markup page

router.get("/:user/:repo", (req, res) => {
  try {
    const user = req.params.user;
    const repo = req.params.repo;
    console.log(repo);

    const getDocs = async (user, repo) => {
      const promise = await databases.listDocuments(database_id, user);
      //console.log(promise);
      const desiredRepo = await promise.documents.filter((el) => {
        return el.repo == repo;
      });
      const { code, link } = desiredRepo[0];
      console.log(link, code);
      const data = { link, code };
      res.send(data);
    };

    getDocs(user, repo);
  } catch (error) {
    console.log(error);
  }
});

//getDocs("Kaku-g", "ai-pdf-summarizer");
module.exports = router;
