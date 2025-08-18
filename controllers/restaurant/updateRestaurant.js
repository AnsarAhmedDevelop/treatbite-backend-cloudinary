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
        if (cuisine) restaurant.cuisine =JSON.parse(cuisine);
        if (type) restaurant.type = JSON.parse(type);
        if (dietary) restaurant.dietary = JSON.parse(dietary);
        if (features) restaurant.features = JSON.parse(features);

        // Cover Photo update
    if (req.files?.coverPhoto?.[0]) {
      if (restaurant.coverPhoto) {
          const url=extractCloudinaryPath(restaurant.coverPhoto)
        await deleteFromCloudinary(url);
      }
      restaurant.coverPhoto = req.files.coverPhoto[0].path;
    }

    // Ambience Photos update
    if (req.files?.ambiencePhotos?.length) {     

          if (restaurant.ambiencePhotos.length > 0) {
                for (const oldPath of restaurant.ambiencePhotos) {
                  const url=extractCloudinaryPath(oldPath)
                    await deleteFromCloudinary(url);
                }
            }
      restaurant.ambiencePhotos = req.files.ambiencePhotos.map(file => file.path);
    }

     
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

