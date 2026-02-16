import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

import { uploadKycImage, uploadKycVideo } from '../controllers/kyc.controller';
import { uploadImage, uploadVideo } from '../middleware/upload';

const router = Router();

router.get('/', protect, getUsers);
router.post(
    "/upload-image",
    protect,
    uploadImage.single("image"),
    uploadKycImage
);

router.post(
    "/upload-video",
    protect,
    uploadVideo.single("video"),
    uploadKycVideo
);


export default router;
