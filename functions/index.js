const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase = require("firebase");
admin.initializeApp();

const app = require("express")();

firebase.initializeApp(require("./util/config"));

const FBAuth = require("./util/fbAuth");
const roleAuth = require("./util/roleAuth");

const {
  getAllPosts,
  getPost,
  createPost,
  editPost,
  uploadPostImage,
  removePost,
  getIndustry,
  addIndustry,
  removeIndustry,
  getLocation,
  addLocation,
  removeLocation,
  getPreferredFor,
  addPreferredFor,
  removePreferredFor,
  sendEmail,
} = require("./handlers/posts");

const {
  signupManual,
  loginManual,
  adminCheck,
  allUsers,
  currentUser,
  loginGoogle,
  logout,
  updatePassword,
  resetPassword,
  deleteUser,
} = require("./handlers/users");

//Post Routes
app.get("/posts", FBAuth, getAllPosts);
app.get("/posts/:postId", FBAuth, getPost);
app.get("/industry", FBAuth, getIndustry);
app.get("/location", FBAuth, getLocation);
app.get("/preferredFor", FBAuth, getPreferredFor);
app.post("/createPost", FBAuth, roleAuth, createPost);
app.post("/editPost/:postId", FBAuth, roleAuth, editPost);
app.post("/uploadPostImage", FBAuth, roleAuth, uploadPostImage);
app.post("/addIndustry", FBAuth, roleAuth, addIndustry);
app.post("/addLocation", FBAuth, roleAuth, addLocation);
app.post("/addPreferredFor", FBAuth, roleAuth, addPreferredFor);
app.post("/sendEmail/:postId", FBAuth, sendEmail);
app.delete("/removePost/:postId", FBAuth, roleAuth, removePost);
app.delete("/removeIndustry/:industryId", FBAuth, roleAuth, removeIndustry);
app.delete("/removeLocation/:locationId", FBAuth, roleAuth, removeLocation);
app.delete(
  "/removePreferredFor/:preferredForId",
  FBAuth,
  roleAuth,
  removePreferredFor
);
//TODO: null

//User Routes
app.get("/allUsers", FBAuth, roleAuth, allUsers);
app.get("/currentUser", FBAuth, currentUser);
app.post("/signup", signupManual);
app.post("/login", loginManual);
app.post("/adminCheck", FBAuth, adminCheck);
app.post("/loginGoogle", loginGoogle);
app.post("/updatePassword", FBAuth, updatePassword);
app.post("/resetPassword", resetPassword);
app.post("/deleteUser", FBAuth, deleteUser);
app.post("/logout", FBAuth, logout);
//TODO: socialLogins (probably in the frontend => Google, Apple and Microsoft)

// like http://something.com/api/[insert here]
exports.api = functions.region("asia-east2").https.onRequest(app);
