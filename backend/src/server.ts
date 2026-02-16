import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5050', // Frontend URL
    credentials: true
}));
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.BACKEND_PORT || 5100;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
