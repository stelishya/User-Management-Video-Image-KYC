import { UpdateQuery } from 'mongoose';
import { IUser } from '../models/user.model';

export interface IUserRepository {
    create(user: Partial<IUser>): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    findAll(query: string, page: number, limit: number, excludeUserId: string): Promise<{ users: IUser[]; total: number }>;
    update(id: string, updateData: UpdateQuery<IUser>): Promise<IUser | null>;
}
