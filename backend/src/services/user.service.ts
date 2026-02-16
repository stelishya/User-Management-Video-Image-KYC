
import { IUserRepository } from '../interfaces/user.repo.interface';
import { UserRepository } from '../repositories/user.repo';

export class UserService {
    private _userRepository: IUserRepository;

    constructor() {
        this._userRepository = new UserRepository();
    }

    async getUsers(query: string, page: number, limit: number, excludeUserId: string) {
        return await this._userRepository.findAll(query, page, limit, excludeUserId);
    }
}
