const { admin, db } = require("../util/admin");
const firebase = require("firebase");

const {
  validateSignupData,
  validateLoginData,
  validateUpdatePasswordData,
} = require("../util/validators");

//Signup Manual
exports.signupManual = (req, res) => {
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
};

//Login Manual Route
exports.loginManual = (req, res) => {
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
};

//Boolean Admin Return
exports.adminCheck = (req, res) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("no role header found");
    return res
      .status(403)
      .json({ error: "Unauthorized. Role header not found" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;

      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      if (
        data.docs[0].data().role &&
        data.docs[0].data().role == "administrator"
      ) {
        return res.json({ authorised: true });
      } else {
        return res.json({ authorised: false });
      }
    })
    .catch((err) => {
      console.error("error while verfing user token ", err);
      return res.status(403).json(err);
    });
};

//Get all users' info
exports.allUsers = (req, res) => {
  db.collection("users")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          userId: doc.data().userId,
          name: doc.data().name,
          email: doc.data().email,
          locationStreetAddress: doc.data().locationStreetAddress,
          locationCity: doc.data().locationCity,
          locationState: doc.data().locationState,
          locationCountry: doc.data().locationCountry,
          website: doc.data().website,
          zipcode: doc.data().zipcode,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(posts);
    })
    .catch((err) => console.error(err));
};

//Get current user's info
exports.currentUser = (req, res) => {
  var currentUserEmail;

  admin
    .auth()
    .verifyIdToken(req.headers.authorization.split("Bearer ")[1])
    .then((decodedToken) => {
      req.user = decodedToken;
      currentUserEmail = req.user.email;
    })
    .then(async () => {
      const userRef = db.collection("users").doc(currentUserEmail);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        res.json({
          message: "unable to find user profile. Contact Administrator",
        });
      } else {
        res.json(userDoc.data());
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err.code,
        message: "Error in retreving user data from token",
      });
    });
};

//Login Google Pop-up
exports.loginGoogle = (req, res) => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      var token = result.credential.accessToken;
      return res.json({ token });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.code });
    });
};

//Log user out
exports.logout = (req, res) => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      return res.status(200).json({ message: "User logged out sucessfully" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.code });
    });
};

//Reset user password
exports.resetPassword = (req, res) => {
  var auth = firebase.auth();
  var emailAddress = req.body.email;
  auth
    .sendPasswordResetEmail(emailAddress)
    .then(() => {
      return res.json({ message: "email sent sucessfully" });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.code,
        message: "Failed to send Password Reset Link",
      });
    });
};

//Update user password
exports.updatePassword = (req, res) => {
  var user = firebase.auth().currentUser;
  const newPassword = {
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  //Validating Entry
  const { valid, errors } = validateUpdatePasswordData(newPassword);

  if (!valid) {
    return res.status(400).json(errors);
  }

  user
    .updatePassword(newPassword.password)
    .then(() => {
      return res.json({ message: "Password updated sucessfully" });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.code,
      });
    });
};

//Delete User Account
exports.deleteUser = (req, res) => {
  var user = firebase.auth().currentUser;
  var email = user.email;
  firebase
    .auth()
    .currentUser.delete()
    .then(() => {
      admin
        .firestore()
        .collection("users")
        .doc(email)
        .delete()
        .then(() => {})
        .catch((err) => {
          return res.status(500).json({
            error: err,
            message: "Error in deleting user information",
          });
        });
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: "user account deleted sucessfully" });
    })
    .catch((err) => {
      return res.json({
        error: err.code,
        message: "Failed to delete user",
      });
    });
};
