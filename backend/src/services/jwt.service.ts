import jwt, { JwtPayload } from 'jsonwebtoken';
import { IJwtService, CustomJwtPayload } from '../interfaces/jwt.service.interface';

export class JwtService implements IJwtService {
    private readonly _secret: string;

    constructor() {
        this._secret = process.env.JWT_SECRET || 'default_secret_key_should_be_changed';
    }

    generateAccessToken(userId: string): string {
        return jwt.sign({ id: userId }, this._secret, { expiresIn: '15m' });
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign({ id: userId }, this._secret, { expiresIn: '7d' });
    }

    verifyAccessToken(token: string): CustomJwtPayload {
        return jwt.verify(token, this._secret) as CustomJwtPayload;
    }

    verifyRefreshToken(token: string): CustomJwtPayload {
        return jwt.verify(token, this._secret) as CustomJwtPayload;
    }
}
