
import { IUser } from '../models/user.model';

export interface IAuthService {
    registerUser(userData: Partial<IUser>): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
    loginUser(userData: Partial<IUser>): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
}
