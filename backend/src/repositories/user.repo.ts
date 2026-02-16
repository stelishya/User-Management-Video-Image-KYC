import User, { IUser } from '../models/user.model';
import mongoose, { QueryFilter, UpdateQuery } from 'mongoose';
import { IUserRepository } from '../interfaces/user.repo.interface';

export class UserRepository implements IUserRepository {
    async create(userData: Partial<IUser>): Promise<IUser> {
        return await User.create(userData);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async findById(id: string | mongoose.Types.ObjectId): Promise<IUser | null> {
        return await User.findById(id);
    }

    async findAll(query: string, page: number, limit: number, excludeUserId: string): Promise<{ users: IUser[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter: QueryFilter<IUser> = { _id: { $ne: excludeUserId } };

        if (query) {
            filter.$and = [
                { _id: { $ne: excludeUserId } },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ];
        }

        const users = await User.find(filter).skip(skip).limit(limit).select('-password');
        const total = await User.countDocuments(filter);

        return { users, total };
    }

    async update(id: string, updateData: UpdateQuery<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, updateData, { new: true });
    }
}
