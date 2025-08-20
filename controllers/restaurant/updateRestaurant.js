import createHttpError from "http-errors";
import restaurantModel from "../../models/restaurantModel/restaurantModel.js";
import { deleteFromCloudinary, extractCloudinaryPath } from "../../services/cloudinaryDelete.js";


export const updateRestaurantController = async (req, res, next) => {
  try {
    const restaurantId = req.params.id;

    // Find restaurant
    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) throw createHttpError(404, "Restaurant not found");
    // console.log(req.user._id.toString(), "req user id")
    // console.log(restaurant.partner.toString(), "restaurant db user id")
    // Check if the restaurant belongs to the logged-in user
    if (restaurant.partner.toString() !== req.user._id.toString()) {
      throw createHttpError(403, "Unauthorized to update this restaurant");
    }

    // Destructure updated fields from request body
    const {
      restaurantName,
      restaurantAddress,
      restaurantContact,
      voucherMin,
      voucherMax,
      restaurantMenu,
      about,
      otherServices,
      cuisine,
      type,
      dietary,
      features,
      removeCoverPhoto,                // NEW
      removedAmbiencePhotos            // NEW

    } = req.body;


    // Update basic fields if present
    if (restaurantName) restaurant.restaurantName = restaurantName;
    if (restaurantAddress) restaurant.restaurantAddress = restaurantAddress;
    if (restaurantContact) restaurant.restaurantContact = restaurantContact;
    if (voucherMin) restaurant.voucherMin = voucherMin;
    if (voucherMax) restaurant.voucherMax = voucherMax;
    if (restaurantMenu) restaurant.restaurantMenu = JSON.parse(restaurantMenu);
    if (about) restaurant.about = about;
    if (otherServices) restaurant.otherServices = otherServices;
    if (cuisine) restaurant.cuisine = JSON.parse(cuisine);
    if (type) restaurant.type = JSON.parse(type);
    if (dietary) restaurant.dietary = JSON.parse(dietary);
    if (features) restaurant.features = JSON.parse(features);

 
    // Handle Cover Photo
      
    if (req.files?.coverPhoto?.[0]) {
      // Case 1: User uploaded a NEW cover photo
     
      if (restaurant.coverPhoto) {
         // If an old cover photo exists, delete it from Cloudinary
        const url = extractCloudinaryPath(restaurant.coverPhoto);
        await deleteFromCloudinary(url);
      }
       // Save the new photo path in DB
      restaurant.coverPhoto = req.files.coverPhoto[0].path;
    } else if (removeCoverPhoto === "true") {
       // Case 2: User explicitly removed the EXISTING cover photo
      // Explicit removal → delete & clear
      if (restaurant.coverPhoto) {
            // Delete from Cloudinary if it exists
        const url = extractCloudinaryPath(restaurant.coverPhoto);
        await deleteFromCloudinary(url);
      }
       // Clear coverPhoto field in DB
      restaurant.coverPhoto = "";
    }

    // Handle Ambience Photos
    let currentAmbience = [...restaurant.ambiencePhotos];

    // Remove selected ambience images
    if (removedAmbiencePhotos) {
      // Parse list of URLs from frontend
      const toRemove = JSON.parse(removedAmbiencePhotos);
        // Delete each removed photo from Cloudinary
      for (const url of toRemove) {
        await deleteFromCloudinary(extractCloudinaryPath(url));
      }
       // Keep only those ambience photos not marked for removal
      currentAmbience = currentAmbience.filter((p) => !toRemove.includes(p));
    }

    // Add newly uploaded ambience photos
    if (req.files?.ambiencePhotos?.length) {
        // Extract Cloudinary paths from newly uploaded files
      const newFiles = req.files.ambiencePhotos.map((file) => file.path);
        // Append them to the existing ambience list
      currentAmbience = [...currentAmbience, ...newFiles];
    }

    // Finally, update DB field with new + old - removed ambience list
    restaurant.ambiencePhotos = currentAmbience;
    //new end

 
    restaurant.isCompleteInfo = true;
    // Save updated restaurant details
    await restaurant.save();

    res.json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

