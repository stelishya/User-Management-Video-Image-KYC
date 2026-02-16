
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const search = (req.query.search as string) || '';
        const currentUserId = (req.user?._id as unknown) as string;

        const { users, total } = await userService.getUsers(search, page, limit, currentUserId);

        res.status(200).json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Get Users Error:', error.message);
        } else {
            console.error('Get Users Error: Unknown error');
        }
        res.status(500).json({ message: 'Server Error' });
    }
};
