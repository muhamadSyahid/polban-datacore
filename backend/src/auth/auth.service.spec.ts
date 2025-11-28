import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { LoginDto } from './dto/login.dto';
import { UserDto } from './dto/user.dto';
import { LoginResponseDto } from './dto/login-response.dto';

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;
  let cacheManager: any;

  const mockDatahubUrl = 'http://datahub-mock';

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'DATAHUB_URL') return mockDatahubUrl;
      return null;
    }),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = { email: 'test@example.com', password: 'pass' };
    const mockUser: UserDto = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    };
    const loginResponse: LoginResponseDto = {
      message: 'Success',
      token: 'abc-123',
      user: mockUser,
    };

    it('should return login response on success', async () => {
      const axiosResponse = {
        data: loginResponse,
        status: 200,
        statusText: 'OK',
      } as AxiosResponse;

      jest.spyOn(httpService, 'post').mockReturnValue(of(axiosResponse));

      const result = await service.login(loginDto);

      expect(httpService.post).toHaveBeenCalledWith(
        `${mockDatahubUrl}/api/login`,
        loginDto,
      );
      expect(result).toEqual(loginResponse);
    });

    it('should throw UnauthorizedException on failure', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error('API Error')));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const token = 'valid-token';

    it('should call logout api and clear cache on success', async () => {
      const axiosResponse = {
        status: 200,
        statusText: 'OK',
      } as AxiosResponse;

      jest.spyOn(httpService, 'post').mockReturnValue(of(axiosResponse));

      const result = await service.logout(token);

      expect(httpService.post).toHaveBeenCalledWith(
        `${mockDatahubUrl}/api/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(cacheManager.del).toHaveBeenCalledWith(`auth_token:${token}`);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should clear cache even if logout api fails', async () => {
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error('Network Error')));

      await service.logout(token);

      expect(httpService.post).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith(`auth_token:${token}`);
    });
  });

  describe('validateToken', () => {
    const token = 'test-token';
    const cacheKey = `auth_token:${token}`;
    const mockUser: UserDto = {
      id: '1',
      name: 'Cached User',
      email: 'cached@test.com',
      role: 'user',
    };

    it('should return user from cache if available (Cache Hit)', async () => {
      mockCacheManager.get.mockResolvedValue(mockUser);

      const result = await service.validateToken(token);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(httpService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should fetch from API and cache result if not in cache (Cache Miss)', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const axiosResponse = {
        data: mockUser,
        status: 200,
        statusText: 'OK',
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await service.validateToken(token);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockDatahubUrl}/api/user`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, mockUser, 300000);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if API fails', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('Invalid Token')));

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });
});
