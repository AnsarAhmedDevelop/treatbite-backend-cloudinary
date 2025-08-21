import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import partnerModel from "../../models/partnerModel/partnerAuthModel.js";
import { deleteFromCloudinary, extractCloudinaryPath } from "../../services/cloudinaryDelete.js";


export const updateProfileController = async (req, res, next) => {
 
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw createHttpError(400, result.array()[0].msg);
    }

    const userId = req.user._id;
    const { fullName, contact } = req.body;
    // console.log(req.body,"req body");
    // console.log(firstName,"firstName");

    const user = await partnerModel.findById(userId);
    if (!user) throw createHttpError(404, "User not found");


    if (fullName) user.fullName = fullName;
    if (contact) user.contact = contact;
    if (req.files?.avatar?.[0]) {
         // Delete old avatar from Cloudinary
         if (user.avatar) {
           const url=extractCloudinaryPath(user.avatar)
           await deleteFromCloudinary(url);
         }
         // Save new avatar 
         user.avatar = req.files.avatar[0].path;
       }

    await user.save();

    res.json({
      message: "Update Profile Successfully",
      user: {
        fullName: user.fullName,
        avatar: user.avatar,
        contact: user.contact,
      },
    });
  } catch (error) {
    next(error);
  }
};

