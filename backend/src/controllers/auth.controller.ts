import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repo';
import { JwtService } from '../services/jwt.service';

const userRepository = new UserRepository();
const jwtService = new JwtService();
const authService = new AuthService(userRepository, jwtService);

export const register = async (req: Request, res: Response) => {
    try {
        console.log('Register Payload:', req.body);
        const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

        // Send refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            accessToken
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Register Error:', error.message);
            res.status(400).json({ message: error.message });
        } else {
            console.error('Register Error: Unknown error');
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

        // Send refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            accessToken
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Login Error:', error.message);
            res.status(400).json({ message: error.message });
        } else {
            console.error('Login Error: Unknown error');
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token available' });
        }

        const accessToken = await authService.refreshToken(refreshToken);
        res.json({ accessToken });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Refresh Token Error:', error.message);
            res.status(401).json({ message: 'Invalid or expired refresh token' });
        } else {
            console.error('Refresh Token Error: Unknown error');
            res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    }
};
