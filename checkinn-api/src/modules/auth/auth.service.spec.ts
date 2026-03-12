import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { User } from './entities/user.entity.js';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  const mockUser: User = {
    id: 'uuid-123',
    username: 'admin',
    password: '$2b$10$hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    userRepository = { findOne: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token-mock') };
    configService = { get: jest.fn().mockReturnValue('3600s') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('deve retornar token quando credenciais validas', async () => {
      (userRepository.findOne! as any).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        username: 'admin',
        password: '123456',
      });

      expect(result.accessToken).toBe('jwt-token-mock');
      expect(result.tokenType).toBe('Bearer');
    });

    it('deve lancar UnauthorizedException quando usuario nao existe', async () => {
      (userRepository.findOne! as any).mockResolvedValue(null);

      await expect(
        service.login({ username: 'x', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lancar UnauthorizedException quando senha incorreta', async () => {
      (userRepository.findOne! as any).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'admin', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('deve retornar usuario ativo', async () => {
      (userRepository.findOne! as any).mockResolvedValue(mockUser);
      const result = await service.validateUser('uuid-123');
      expect(result).toEqual(mockUser);
    });

    it('deve lancar UnauthorizedException quando nao encontrado', async () => {
      (userRepository.findOne! as any).mockResolvedValue(null);
      await expect(service.validateUser('x')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
