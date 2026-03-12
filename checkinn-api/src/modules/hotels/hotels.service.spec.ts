import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { HotelsService } from './hotels.service.js';
import { Hotel } from './entities/hotel.entity.js';

describe('HotelsService', () => {
  let service: HotelsService;
  let hotelRepository: jest.Mocked<Partial<Repository<Hotel>>>;
  let cacheManager: Record<string, jest.Mock>;

  const mockHotel: Hotel = {
    id: 'hotel-uuid-1',
    name: 'Hotel CheckInn',
    city: 'Sao Paulo',
    state: 'SP',
    address: 'Av. Paulista, 1000',
    totalRooms: 100,
    starsRating: 4,
    description: 'Hotel premium',
    phone: '11999999999',
    email: 'contato@checkinn.com',
    isActive: true,
    reservations: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    hotelRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };
    cacheManager = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        { provide: getRepositoryToken(Hotel), useValue: hotelRepository },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
  });

  describe('create', () => {
    const dto = {
      name: 'Hotel CheckInn',
      city: 'Sao Paulo',
      state: 'SP',
      address: 'Av. Paulista, 1000',
      totalRooms: 100,
    };

    it('deve criar hotel com sucesso', async () => {
      (hotelRepository.create! as any).mockReturnValue(mockHotel);
      (hotelRepository.save! as any).mockResolvedValue(mockHotel);

      const result = await service.create(dto);

      expect(result.id).toBe(mockHotel.id);
      expect(result.name).toBe(mockHotel.name);
    });

    it('deve lancar ConflictException em duplicidade', async () => {
      (hotelRepository.create! as any).mockReturnValue(mockHotel);
      (hotelRepository.save! as any).mockRejectedValue({ code: '23505' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve buscar no banco quando cache miss', async () => {
      cacheManager.get.mockResolvedValue(null);
      (hotelRepository.findAndCount! as any).mockResolvedValue([
        [mockHotel],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe('findById', () => {
    it('deve retornar hotel existente', async () => {
      (hotelRepository.findOne! as any).mockResolvedValue(mockHotel);
      const result = await service.findById('hotel-uuid-1');
      expect(result).toEqual(mockHotel);
    });

    it('deve lancar NotFoundException quando nao existe', async () => {
      (hotelRepository.findOne! as any).mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toThrow(NotFoundException);
    });
  });
});
