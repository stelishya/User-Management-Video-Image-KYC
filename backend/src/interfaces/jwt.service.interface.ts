import { JwtPayload } from 'jsonwebtoken';

export interface CustomJwtPayload extends JwtPayload {
    id: string;
}

export interface IJwtService {
    generateAccessToken(userId: string): string;
    generateRefreshToken(userId: string): string;
    verifyAccessToken(token: string): CustomJwtPayload;
    verifyRefreshToken(token: string): CustomJwtPayload;
}
