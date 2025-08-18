import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import userModel from "../../models/userModel/userAuthModel.js";
import { deleteFromCloudinary, extractCloudinaryPath } from "../../services/cloudinaryDelete.js";

export const updateProfileController = async (req, res, next) => {
 
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw createHttpError(400, result.array()[0].msg);
    }

    const userId = req.user._id;
    const { fullName, email } = req.body;
    // console.log(req.body,"req body");
    // console.log(firstName,"firstName");

    const user = await userModel.findById(userId);
    if (!user) throw createHttpError(404, "User not found");

    if (email && user.email !== email) {
      const emailExist = await userModel.findOne({ email });
      if (emailExist) throw createHttpError(409, "Email already in use");
    }

    if (req.files?.avatar?.[0]) {
      // Delete old avatar from Cloudinary
      if (user.avatar) {
        const url=extractCloudinaryPath(user.avatar)
        await deleteFromCloudinary(url);
      }
      // Save new avatar
      // user.avatar = {
      //   url: req.files.avatar[0].path,
      //   public_id: req.files.avatar[0].filename
      // };
      user.avatar = req.files.avatar[0].path;
    }


    if (fullName) user.fullName = fullName;
    if (email) user.email = email;  

    await user.save();

    res.json({
      message: "Update Profile Successfully",
      user: {
        fullName: user.fullName,
        avatar: user.avatar,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
