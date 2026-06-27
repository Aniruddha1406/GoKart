import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import blacklistModel from "../models/blacklist.model.js";

export const customer_authenticate = async (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    if(await blacklistModel.exists({token})){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);                
    if (decoded.role !== "customer") {                                                                                                       
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = {
  ...decoded,
  _id: decoded.userId || decoded._id,
};
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" , error});
  }
};
