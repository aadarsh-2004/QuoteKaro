// const admin = require("./firebase");

// const verifyFirebaseToken = async (req, res, next) => {
//   const token = req.headers.authorization?.split("Bearer ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: No token provided" });
//   }

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     req.user = decodedToken;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = verifyFirebaseToken;
