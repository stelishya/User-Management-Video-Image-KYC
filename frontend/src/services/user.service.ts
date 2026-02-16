
import api from '../api/api';

export interface User {
    _id: string;
    name: string;
    email: string;
    kyc?: {
        imageUrl?: string;
        videoUrl?: string;
        status?: 'pending' | 'verified' | 'rejected';
        submittedAt?: Date;
    };
}

export const getUsers = async (page: number, limit: number, search: string) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};
