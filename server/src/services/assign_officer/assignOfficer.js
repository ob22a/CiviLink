import User from "../../models/User.js";
import Officer from "../../models/Officer.js";
import mongoose from "mongoose";

const promoteToOfficer = async (userId, promotionData, adminId) => {
  // Get the user
  const user = await User.findById(userId);
  
  // Convert to plain object
  const userObj = user.toObject();
  
  // Delete the user
  await User.findByIdAndDelete(userId);
  
  // Create as officer with same _id
  const officer = await Officer.create({
    _id: userId,  // Keep same ID
    fullName: userObj.fullName,
    email: userObj.email,
    password: userObj.password,
    googleId: userObj.googleId,
    refreshToken: userObj.refreshToken,
    role: 'officer',
    department: promotionData.department,
    subcity: promotionData.subcity || "unknown",
    assignedBy: adminId
  });
  
  return officer;
};

export { promoteToOfficer };