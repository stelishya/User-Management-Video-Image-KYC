
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        // connecting to the URI from env
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user-management');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
        } else {
            console.error('Error connecting to MongoDB: Unknown error');
        }

        // If env URI fails, use local fallback
        console.log('Attempting to connect to local MongoDB (127.0.0.1)...');
        try {
            const conn = await mongoose.connect('mongodb://127.0.0.1:27017/user-management');
            console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
        } catch (localError: unknown) {
            if (localError instanceof Error) {
                console.error(`Local MongoDB connection failed: ${localError.message}`);
            } else {
                console.error('Local MongoDB connection failed: Unknown error');
            }
            process.exit(1);
        }
    }
};

export default connectDB;
