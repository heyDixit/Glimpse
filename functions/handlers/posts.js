const { admin } = require("../util/admin");
const config = require("../util/config");

//Get all Posts
exports.getAllPosts = (req, res) => {
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
};

//Get a Post
exports.getPost = async (req, res) => {
  const postRef = admin.firestore().collection("posts").doc(req.params.postId);
  const postDoc = await postRef.get().then((data) => {
    if (!data.exists) {
      res
        .status(404)
        .json({ error: "Cannot retreive post. Document not found" });
    } else {
      res.json(data.data());
    }
  });
};

//Create new Post
exports.createPost = (req, res) => {
  const noImg = "no-image.png";
  const noImageURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`;

  let pictureURLToBeSet;

  if (!req.body.pictureURL) {
    pictureURLToBeSet = noImageURL;
  } else {
    pictureURLToBeSet = req.body.pictureURL;
  }

  const newPost = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    industry: req.body.industry,
    preferredFor: req.body.preferredFor,
    picture: pictureURLToBeSet,
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
};

//Edit Post
exports.editPost = async (req, res) => {
  const noImg = "no-image.png";
  const noImageURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`;

  let pictureURLToBeSet;

  if (!req.body.pictureURL) {
    pictureURLToBeSet = noImageURL;
  } else {
    pictureURLToBeSet = req.body.pictureURL;
  }

  let editedPost = {
    picture: pictureURLToBeSet,
    createdAt: new Date().toISOString(),
  };

  if (req.body.title && req.body.title != "") {
    editedPost.title = req.body.title;
  }
  if (req.body.description && req.body.description != "") {
    editedPost.description = req.body.description;
  }
  if (req.body.location && req.body.location != "") {
    editedPost.location = req.body.location;
  }
  if (req.body.industry && req.body.industry != "") {
    editedPost.industry = req.body.industry;
  }
  if (req.body.preferredFor && req.body.preferredFor != "") {
    editedPost.preferredFor = req.body.preferredFor;
  }

  const postRef = admin.firestore().collection("posts").doc(req.params.postId);

  const data = await postRef
    .update(editedPost)
    .then(() => {
      res.json(`Document ${req.params.postId} sucessfully updated`);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

//Remove Post
exports.removePost = (req, res) => {
  admin
    .firestore()
    .collection("posts")
    .doc(req.params.postId)
    .delete()
    .then(() => {
      res.status(200).json("Post deleted successfully");
    })
    .catch((err) => {
      res.status(500).json({ error: err, message: "Error in deleting post" });
    });
};

//Upload Image for Post
exports.uploadPostImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded;
  let imgsURL;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (
      mimetype !== "image/jpeg" &&
      mimetype !== "image/jpg" &&
      mimetype !== "image/bmp" &&
      mimetype !== "image/png"
    ) {
      return res.status(400).json({ error: "Wrong file type submitted." });
    }

    //something.somethingelse.png
    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    //324685745346.png
    imageFileName = `${Math.round(
      Math.random() * 46894321654
    )}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imgURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;

        return res.status(201).json(imgURL);
      })
      .catch((err) => {
        return res.status(500).fson({ error: error.code });
      });
  });
  busboy.end(req.rawBody);
};

//Get fields -> industry
exports.getIndustry = async (req, res) => {
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
      res.status(500).json({ error: err });
    });
};

//Add fields -> industry
exports.addIndustry = async (req, res) => {
  const industryRef = admin.firestore().collection("fields").doc("industry");

  const data = await industryRef
    .update({
      name: admin.firestore.FieldValue.arrayUnion(req.body.name),
    })
    .then(() => {
      res.json(`${req.body.name} added sucessfully`);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

//Remove fields -> industry
exports.removeIndustry = async (req, res) => {
  const industryRef = admin.firestore().collection("fields").doc("industry");

  const removeRes = await industryRef
    .update({
      name: admin.firestore.FieldValue.arrayRemove(req.params.industryId),
    })
    .then(() => {
      res.json(`${req.params.industryId} removed sucessfully`);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

//Get fields -> location
exports.getLocation = async (req, res) => {
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
      res.status(500).json({ error: err });
    });
};

//Add fields -> location
exports.addLocation = async (req, res) => {
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
      res.status(500).json({ error: err });
    });
};

//Remove fields -> location
exports.removeLocation = async (req, res) => {
  const locationRef = admin.firestore().collection("fields").doc("location");

  const removeRes = await locationRef
    .update({
      name: admin.firestore.FieldValue.arrayRemove(req.params.locationId),
    })
    .then(() => {
      res.json(`${req.params.locationId} removed sucessfully`);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
};

//Get fields -> preferredFor
exports.getPreferredFor = async (req, res) => {
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
      res.status(500).json({ error: err });
    });
};

//Add fields -> preferredFor
exports.addPreferredFor = async (req, res) => {
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
      res.status(500).json({ error: err });
    });
};

//Remove fields -> preferredFor
exports.removePreferredFor = async (req, res) => {
  const preferredForRef = admin
    .firestore()
    .collection("fields")
    .doc("preferredFor");

  const removeRes = await preferredForRef
    .update({
      name: admin.firestore.FieldValue.arrayRemove(req.params.preferredForId),
    })
    .then(() => {
      return res.json(`${req.params.preferredForId} removed sucessfully`);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

//Send Mail after request
exports.sendEmail = async (req, res) => {
  var currentUserEmail;
  var userDetails,
    postDetails,
    numberOfStudents,
    preferredDates,
    scheduledMeeting;

  if (
    !req.body.numberOfStudents ||
    !req.body.preferredDates ||
    !req.body.scheduledMeeting
  ) {
    return res.json({ error: "Request body fields missing." });
  } else {
    numberOfStudents = req.body.numberOfStudents;
    preferredDates = req.body.preferredDates;
    scheduledMeeting = req.body.scheduledMeeting;
  }

  admin
    .auth()
    .verifyIdToken(req.headers.authorization.split("Bearer ")[1])
    .then((decodedToken) => {
      req.user = decodedToken;
      currentUserEmail = req.user.email;
    })
    .catch((err) => {
      res.status(500).json({
        error: err.code,
        message: "Error in retreving user data from token",
      });
    });

  const postRef = admin.firestore().collection("posts").doc(req.params.postId);
  const postDoc = await postRef.get();

  const userRef = admin.firestore().collection("users").doc(currentUserEmail);
  const userDoc = await userRef.get();

  if (!postDoc.exists || !userDoc.exists) {
    console.log("unable to find such a document");
  } else {
    userDetails = userDoc.data();
    postDetails = postDoc.data();

    const emailHTMLContent = `
    <html>
  <head>
    <style>
      body {
        padding-left: 10%;
        padding-right: 10%;
        padding-top: 2%;
        padding-bottom: 5%;
        font-family: "Open Sans", sans-serif;
        line-height: 1.25;
      }

      table {
        border: 1px solid #ccc;
        border-collapse: collapse;
        margin: 0;
        padding: 0;
        width: 100%;
        table-layout: fixed;
      }

      table caption {
        font-size: 1.5em;
        margin: 0.5em 0 0.75em;
      }

      table tr {
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        padding: 0.35em;
      }

      table th,
      table td {
        padding: 0.625em;
        text-align: center;
      }

      table th {
        font-size: 0.85em;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .subheading {
        color: #888888;
      }
      hr {
        color: #777777;
      }
      h1 {
        color: #222831;
        word-spacing: 1.5em;
        font-size: 2.4em;
      }
      a {
        text-decoration: none;
        font-style: italic;
        color: black;
      }
      .Signature {
        padding: 10px;
        font-size: larger;
        line-height: 120%;
      }
    </style>
  </head>
  <body>
    <h1>
      <strong><center>Glimpse</center></strong>
    </h1>
    <br />
    <h2>You've got a response!</h2>
    <small>Requested at: <b>${new Date().toString()}</b></small>
    <p class="subheading">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
      eiusmodati mat tempor incididunt ut labore et dolore magna aliqua
    </p>
    <br />
    <hr />
    <br />
    <table>
      <caption>
        University Information
      </caption>
      <tbody>
        <tr>
          <td>Name</td>
          <td>${userDetails.name}</td>
        </tr>
        <tr>
          <td>Email Address</td>
          <td>${userDetails.email}</td>
        </tr>
        <tr>
          <td>Scheduled Meeting Date</td>
          <td>${req.body.scheduledMeeting}</td>
        </tr>
        <tr>
          <td>Preferred Dates</td>
          <td>${req.body.preferredDates}</td>
        </tr>
        <tr>
          <td>No. of Students</td>
          <td>${req.body.numberOfStudents}</td>
        </tr>
        <tr>
          <td>Address</td>
          <td>${userDetails.locationStreetAddress}</td>
        </tr>
        <tr>
          <td>City</td>
          <td>${userDetails.locationCity}</td>
        </tr>
        <tr>
          <td>State</td>
          <td>${userDetails.locationState}</td>
        </tr>
        <tr>
          <td>Country</td>
          <td>${userDetails.locationCountry}</td>
        </tr>
        <tr>
          <td>Zip Code</td>
          <td>${userDetails.zipcode}</td>
        </tr>
        <tr>
          <td>Website</td>
          <td>
            <a href="${userDetails.website}" target="_blank"
              >${userDetails.name}</a
            >
          </td>
        </tr>
      </tbody>
    </table>
    <br />
    <br />
    <hr />
    <br />
    <table>
      <caption>
        Industry Information
      </caption>
      <tbody>
        <tr>
          <td>Title</td>
          <td>${postDetails.title}</td>
        </tr>
        <tr>
          <td>Industry</td>
          <td>${postDetails.industry}</td>
        </tr>
        <tr>
          <td>Location</td>
          <td>${postDetails.location}</td>
        </tr>
        <tr>
          <td>Preferred For</td>
          <td>${postDetails.preferredFor}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>${postDetails.description}</td>
        </tr>
        <tr>
          <td>Post ID</td>
          <td>${req.params.postId}</td>
        </tr>
      </tbody>
    </table>
    <div class="Signature">
      <br /><br /><small
        >Warm Regards,<br />Glimpse Development Team<br />${new Date().toDateString()}<b></b
      ></small>
    </div>
  </body>
</html>

    `;
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "noreply.glimpseivf@gmail.com",
        pass: "Boomciao99",
      },
    });

    const mailOptions = {
      from: "noreply.glimpseivf@gmail.com",
      to:
        "glimpseivf@gmail.com, kunalprasad144999@gmail.com, nikhilgup99@gmail.com",
      subject: `Request from ${userDetails.name}`,
      html: emailHTMLContent,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        return res.json({ error: err.code });
      } else {
        console.log(info);
        return res.json({
          message: "Mail sucessfully sent." + info.response,
        });
      }
    });
  }
};
