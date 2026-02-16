import bcrypt from 'bcrypt';
import { IUser } from '../models/user.model';
import { IAuthService } from '../interfaces/auth.service.interface';
import { IUserRepository } from '../interfaces/user.repo.interface';
import { UserRepository } from '../repositories/user.repo';
import { JwtService } from './jwt.service';

export class AuthService implements IAuthService {
    private _userRepository: IUserRepository;
    private _jwtService: JwtService;

    constructor(userRepository: IUserRepository, jwtService: JwtService) {
        this._userRepository = userRepository;
        this._jwtService = jwtService;
    }

    async registerUser(userData: Partial<IUser>): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
        if (!userData.email || !userData.password || !userData.name) {
            throw new Error('Please provide all fields');
        }

        const existingUser = await this._userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = await this._userRepository.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
        });

        const accessToken = this._jwtService.generateAccessToken((newUser._id as unknown) as string);
        const refreshToken = this._jwtService.generateRefreshToken((newUser._id as unknown) as string);

        return { user: newUser, accessToken, refreshToken };
    }

    async loginUser(userData: Partial<IUser>): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
        if (!userData.email || !userData.password) {
            throw new Error('Please provide email and password');
        }

        const user = await this._userRepository.findByEmail(userData.email);
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(userData.password, user.password!);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        const accessToken = this._jwtService.generateAccessToken((user._id as unknown) as string);
        const refreshToken = this._jwtService.generateRefreshToken((user._id as unknown) as string);

        return { user, accessToken, refreshToken };
    }

    async refreshToken(token: string): Promise<string> {
        const decoded = this._jwtService.verifyRefreshToken(token);
        const user = await this._userRepository.findById(decoded.id);

        if (!user) {
            throw new Error('User not found');
        }

        return this._jwtService.generateAccessToken((user._id as unknown) as string);
    }
}
