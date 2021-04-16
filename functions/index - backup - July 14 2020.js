const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { firestore } = require("firebase-admin");
const firebase = require("firebase");
admin.initializeApp();

const express = require("express");
const app = express();

const config = {
  apiKey: "AIzaSyCRFwWwKCxYjovxzsRFRzug98RM2IXJIug",
  authDomain: "glimpse-5d4d1.firebaseapp.com",
  databaseURL: "https://glimpse-5d4d1.firebaseio.com",
  projectId: "glimpse-5d4d1",
  storageBucket: "glimpse-5d4d1.appspot.com",
  messagingSenderId: "494246166819",
  appId: "1:494246166819:web:973e5042e20a542ddf4c96",
  measurementId: "G-8NDP86D6GL",
};

const { validateSignupData, validateLoginData } = require("./util/validators");
const FBAuth = require("./util/fbAuth");
const roleAuth = require("./util/roleAuth");

firebase.initializeApp(config);

//Get all Posts
app.get("/posts", FBAuth, (req, res) => {
  admin
    .firestore()
    .collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          location: doc.data().location,
          industry: doc.data().industry,
          preferredFor: doc.data().preferredFor,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(posts);
    })
    .catch((err) => console.error(err));
});

//Get fields -> industry
app.get("/industry", FBAuth, async (req, res) => {
  const industryRef = admin.firestore().collection("fields").doc("industry");
  const doc = await industryRef
    .get()
    .then((data) => {
      if (!data.exists) {
        res.json("No such document exists");
      } else {
        res.json(data.data());
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

//Add fields -> industry
app.post("/addIndustry", FBAuth, roleAuth, async (req, res) => {
  const industryRef = admin.firestore().collection("fields").doc("industry");

  const unionRes = await industryRef
    .update({
      name: admin.firestore.FieldValue.arrayUnion(req.body.name),
    })
    .then(() => {
      res.json(`${req.body.name} added sucessfully`);
    })
    .catch((err) => {
      console.error(err);
    });
});

//Remove fields -> industry
app.post("/removeIndustry", FBAuth, roleAuth, async (req, res) => {
  const industryRef = admin.firestore().collection("fields").doc("industry");

  const removeRes = await industryRef
    .update({
      name: admin.firestore.FieldValue.arrayRemove(req.body.name),
    })
    .then(() => {
      res.json(`${req.body.name} removed sucessfully`);
    })
    .catch((err) => {
      console.error(err);
    });
});

//Get fields -> location
app.get("/location", FBAuth, async (req, res) => {
  const locationRef = admin.firestore().collection("fields").doc("location");
  const doc = await locationRef
    .get()
    .then((data) => {
      if (!data.exists) {
        res.json("No such document exists");
      } else {
        res.json(data.data());
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

//Add fields -> location
app.post("/addLocation", FBAuth, roleAuth, async (req, res) => {
  const locationRef = admin.firestore().collection("fields").doc("location");

  const unionRes = await locationRef
    .update({
      name: admin.firestore.FieldValue.arrayUnion(req.body.name),
    })
    .then(() => {
      res.json(`${req.body.name} added sucessfully`);
    })
    .catch((err) => {
      console.error(err);
    });
});

//Remove fields -> location
app.post("/removeLocation", FBAuth, roleAuth, async (req, res) => {
  const locationRef = admin.firestore().collection("fields").doc("location");

  const removeRes = await locationRef
    .update({
      name: admin.firestore.FieldValue.arrayRemove(req.body.name),
    })
    .then(() => {
      res.json(`${req.body.name} removed sucessfully`);
    })
    .catch((err) => {
      console.error(err);
    });
});

//Get fields -> preferredFor
app.get("/preferredFor", FBAuth, async (req, res) => {
  const preferredForRef = admin
    .firestore()
    .collection("fields")
    .doc("preferredFor");
  const doc = await preferredForRef
    .get()
    .then((data) => {
      if (!data.exists) {
        res.json("No such document exists");
      } else {
        res.json(data.data());
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

//Add fields -> preferredFor
app.post("/addPreferredFor", FBAuth, roleAuth, async (req, res) => {
  const preferredForRef = admin
    .firestore()
    .collection("fields")
    .doc("preferredFor");

  const unionRes = await preferredForRef
    .update({
      name: admin.firestore.FieldValue.arrayUnion(req.body.name),
    })
    .then(() => {
      res.json(`${req.body.name} added sucessfully`);
    })
    .catch((err) => {
      console.error(err);
    });
});

//Remove fields -> preferredFor
app.post("/removePreferredFor", FBAuth, roleAuth, async (req, res) => {
  const preferredForRef = admin
    .firestore()
    .collection("fields")
    .doc("preferredFor");

  const removeRes = await preferredForRef
    .update({
      name: admin.firestore.FieldValue.arrayRemove(req.body.name),
    })
    .then(() => {
      res.json(`${req.body.name} removed sucessfully`);
    })
    .catch((err) => {
      console.error(err);
    });
});

//Create new Post
app.post("/createPost", FBAuth, roleAuth, (req, res) => {
  const newPost = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    industry: req.body.industry,
    preferredFor: req.body.preferredFor,
    createdAt: new Date().toISOString(),
  };
  admin
    .firestore()
    .collection("posts")
    .add(newPost)
    .then((doc) => {
      res.json({ message: `Document ${doc.id} created sucessfully.` });
    })
    .catch((err) => {
      res.status(500).json({ error: `Something went wrong.` });
      console.error(err);
    });
});

//Signup Manual
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    website: req.body.website,
    locationStreetAddress: req.body.locationStreetAddress,
    locationCity: req.body.locationCity,
    locationState: req.body.locationState,
    locationCountry: req.body.locationCountry,
    zipcode: req.body.zipcode,
  };

  //Validating Entry
  const { valid, errors } = validateSignupData(newUser);

  if (!valid) {
    return res.status(400).json(errors);
  }

  let userId, token;

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((tokenId) => {
      token = tokenId;

      if (newUser.website.toString().trim().substring(0, 4) !== "http") {
        newUser.website = `http://${newUser.website.toString().trim()}`;
      }

      const userCredentials = {
        email: newUser.email,
        name: newUser.name,
        website: newUser.website,
        locationStreetAddress: newUser.locationStreetAddress,
        locationCity: newUser.locationCity,
        locationState: newUser.locationState,
        locationCountry: newUser.locationCountry,
        zipcode: req.body.zipcode,
        createdAt: new Date().toISOString(),
        userId: userId,
      };
      admin
        .firestore()
        .doc(`/users/${userCredentials.email}`)
        .set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "email is already taken." });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

//Login Route
app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  //validating the entires
  const { valid, errors } = validateLoginData(user);

  if (!valid) {
    return res.status(400).json(errors);
  }
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        return res
          .status(403)
          .json({ general: "wrong credentails. Please try again" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.region("asia-east2").https.onRequest(app);
