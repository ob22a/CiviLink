import User from "../models/User.js";
import FaydaId from "../models/faydaIdSchema.js";
import KebeleId from "../models/kebeleIdSchema.js";
import bcrypt from "bcryptjs";

const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({
      success: false,
      error: { message: "User not found" }
    })

    return res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      error: { message: "Server error while fetching user info" }
    })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, confirmPassword, newPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { message: "New passwords do not match" }
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).select("+password");

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        error: { message: "Current password is incorrect" }
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
}

const deleteIdInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { idType } = req.params; // Expecting 'fayda', 'kebele', or 'both'

    let results = { fayda: null, kebele: null };

    if (idType === "fayda" || idType === "both") {
      results.fayda = await FaydaId.findOneAndDelete({ userId });
    }

    if (idType === "kebele" || idType === "both") {
      results.kebele = await KebeleId.findOneAndDelete({ userId });
    }

    if (!results.fayda && !results.kebele) {
      return res.status(404).json({
        success: false,
        message: "No matching ID records found to delete"
      });
    }

    return res.status(200).json({
      success: true,
      message: `${idType} information deleted successfully`
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      error: { message: "Server error while deleting ID info" }
    });
  }
}

export {
  getUserInfo,
  changePassword,
  deleteIdInfo
};