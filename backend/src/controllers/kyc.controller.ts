import { Request, Response } from 'express';
import mongoose, { Types, UpdateQuery } from 'mongoose';
import { UserRepository } from '../repositories/user.repo';
import { IUser } from '../models/user.model';

const userRepository = new UserRepository();

// Helper to update user KYC status
const handleKycUpdate = async (userId: string | Types.ObjectId, updateData: UpdateQuery<IUser>, res: Response) => {
    try {
        const currentUser = await userRepository.findById(userId);

        // Check if now both are present
        const hasImage = (updateData['kyc.imageUrl'] as string) || currentUser?.kyc?.imageUrl;
        const hasVideo = (updateData['kyc.videoUrl'] as string) || currentUser?.kyc?.videoUrl;

        if (hasImage && hasVideo) {
            updateData['kyc.status'] = 'pending';
            updateData['kyc.submittedAt'] = new Date();
        }

        const updatedUser = await userRepository.update(userId.toString(), updateData);
        res.json({ message: "KYC Uploaded successfully", user: updatedUser });
    } catch (err: unknown) {
        console.error("KYC Update Error:", err);
        res.status(500).json({ message: "KYC update failed" });
    }
};

export const uploadKycImage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const file = req.file; // Single file from uploadImage.single("image")
        if (!file) {
            return res.status(400).json({ message: "No image provided" });
        }

        console.log("Uploaded Image:", file.path);
        const updateData: UpdateQuery<IUser> = { 'kyc.imageUrl': file.path };

        await handleKycUpdate(userId, updateData, res);
    } catch (err: unknown) {
        console.error("Image Upload Error:", err);
        res.status(500).json({ message: "Image upload failed" });
    }
};

export const uploadKycVideo = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const file = req.file; // Single file from uploadVideo.single("video")
        if (!file) {
            return res.status(400).json({ message: "No video provided" });
        }

        console.log("Uploaded Video:", file.path);
        const updateData: UpdateQuery<IUser> = { 'kyc.videoUrl': file.path };

        await handleKycUpdate(userId, updateData, res);
    } catch (err: unknown) {
        console.error("Video Upload Error:", err);
        res.status(500).json({ message: "Video upload failed" });
    }
};
