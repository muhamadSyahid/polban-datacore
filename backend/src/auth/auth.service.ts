import {
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import { UserDto } from './dto/user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { DATACORE_SYSTEM_AUTH_TOKEN_CACHE_KEY } from '../constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly datahubUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.datahubUrl = this.configService.get<string>('DATAHUB_URL');
  }

  // Login Proxy
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.datahubUrl}/api/login`, loginDto),
      );
      return response.data as LoginResponseDto;
    } catch (error) {
      const errorMsg = error?.message || String(error);
      this.logger.error(`Login failed for ${loginDto.email}`, errorMsg);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // Logout Proxy
  async logout(token: string) {
    try {
      await lastValueFrom(
        this.httpService.post(
          `${this.datahubUrl}/api/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );
      await this.cacheManager.del(`auth_token:${token}`);
      return { message: 'Logged out successfully' };
    } catch {
      await this.cacheManager.del(`auth_token:${token}`);
    }
  }

  async validateToken(token: string): Promise<UserDto> {
    const cacheKey = `auth_token:${token}`;

    const cachedUser: UserDto = await this.cacheManager.get(cacheKey);
    if (cachedUser) return cachedUser;

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.datahubUrl}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const user: UserDto = response.data;

      // 5 minutes cache
      await this.cacheManager.set(cacheKey, user, 300000);

      return user;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getSystemToken(): Promise<string> {
    const cacheKey = DATACORE_SYSTEM_AUTH_TOKEN_CACHE_KEY;

    const cachedToken = await this.cacheManager.get<string>(cacheKey);
    if (cachedToken) return cachedToken;

    const email = this.configService.get<string>('DATACORE_SYSTEM_EMAIL');
    const password = this.configService.get<string>('DATACORE_SYSTEM_PASSWORD');

    try {
      const response = await this.login({ email, password });

      await this.cacheManager.set(cacheKey, response.token, 60 * 60 * 1000);

      return response.token;
    } catch (error) {
      this.logger.error('Failed to authenticate as System User', error);
      throw new Error('System authentication failed');
    }
  }
}
