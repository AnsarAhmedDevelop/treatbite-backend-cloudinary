import cloudinary from './../config/cloudinary.js';

export const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
    console.log(`Deleted from Cloudinary: ${public_id}`);
  } catch (err) {
    console.error(`Failed to delete ${public_id} from Cloudinary:`, err);
  }
};

export function extractCloudinaryPath(url) {
    return url.replace(/^.*upload\/v\d+\//, "") // remove everything before folder path
              .replace(/\.[^/.]+$/, "");        // remove file extension
}