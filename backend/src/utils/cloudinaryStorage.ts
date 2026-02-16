import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

export const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "kyc/images",
    allowed_formats: ["jpg", "png", "jpeg"],
  }),
});

export const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "kyc/videos",
    resource_type: "video",
  }),
});
