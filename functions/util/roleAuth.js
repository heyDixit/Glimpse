const { admin, db } = require("./admin");

module.exports = async (req, res, next) => {
  let role;

  if (req.headers.role && req.headers.role.startsWith("Designated ")) {
    role = req.headers.role.split("Designated ")[1];
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
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
      if (data.docs[0].data().role && data.docs[0].data().role == role) {
        return next();
      } else {
        return res.status(403).json({ error: "Unauthorized." });
      }
    })
    .catch((err) => {
      console.error("error while verfing user token ", err);
      return res.status(403).json(err);
    });
};
