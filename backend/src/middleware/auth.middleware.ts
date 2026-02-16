
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { UserRepository } from '../repositories/user.repo';

import { IUser } from '../models/user.model';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser | null;
        }
    }
}

const jwtService = new JwtService();
const userRepository = new UserRepository();

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwtService.verifyAccessToken(token);

            // Get user from the token
            req.user = await userRepository.findById(decoded.id);

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
