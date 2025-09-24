import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.AccessToken;
    if (!token) {
      return next(new Error("Unauthorized request — please login first"));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id).select("_id username fullName profilePic email profilePrivate blockedUsers");

    if (!user) {
      return next(new Error( "Invalid Access Token"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new Error( error.message || "Internal Server Error"));
  }
};
export default verifyUser;
