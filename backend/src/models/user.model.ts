
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    name: string;
    email: string;
    password?: string;
    kyc?: {
        imageUrl?: string;
        videoUrl?: string;
        status: 'pending' | 'verified' | 'rejected';
        submittedAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        kyc: {
            imageUrl: { type: String },
            videoUrl: { type: String },
            status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
            submittedAt: { type: Date }
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>('Users', UserSchema);
