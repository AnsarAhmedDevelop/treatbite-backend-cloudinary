import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "general";
    if (file.fieldname === "avatar") folder = "avatars";
    if (file.fieldname === "coverPhoto") folder = "restaurant/cover";
    if (file.fieldname === "ambiencePhotos") folder = "restaurant/ambience";

    return {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

// This function ensures only certain file formats are allowed.
const fileFilter = (req, file, cb) => {
  // Get file extension in lowercase (e.g., ".jpg")
  const ext = path.extname(file.originalname).toLowerCase();
  // Get MIME type from file metadata (e.g., "image/jpeg")
  const mime = file.mimetype;

  // Check if both extension and MIME type are allowed
  if (![".jpg", ".jpeg", ".png",".webp"].includes(ext) ||
    !["image/jpeg", "image/png", "image/webp"].includes(mime)) {
    // Reject file upload with an error message
    return cb(new Error("Only JPG, JPEG, webp and PNG images are allowed."), false);
  }
  // Accept the file
  cb(null, true);
};


export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
  { name: "ambiencePhotos", maxCount: 5 },
]);
// Now req.files will contain Cloudinary URLs instead of local paths.





