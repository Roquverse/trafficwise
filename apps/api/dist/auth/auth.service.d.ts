import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        role: any;
    }>;
    register(email: string, pass: string, role?: Role, name?: string): Promise<{
        access_token: string;
        role: any;
    }>;
}
