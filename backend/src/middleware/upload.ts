import multer from "multer";
import { imageStorage, videoStorage } from "../utils/cloudinaryStorage";

export const uploadImage = multer({ storage: imageStorage });
export const uploadVideo = multer({ storage: videoStorage });
