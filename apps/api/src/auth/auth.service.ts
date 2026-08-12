import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
    };
  }
  
  async register(email: string, pass: string, role: Role = Role.COMMUTER, name?: string) {
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }
    
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(pass, salt);
    
    // Default name if not provided
    const finalName = name || email.split('@')[0];
    
    const user = this.usersRepository.create({ email, passwordHash, role, name: finalName });
    await this.usersRepository.save(user);
    
    return this.login(user);
  }
}
