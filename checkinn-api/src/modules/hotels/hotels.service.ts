import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Hotel } from './entities/hotel.entity.js';
import { CreateHotelRequestDto } from './dto/create-hotel-request.dto.js';
import { HotelResponseDto } from './dto/hotel-response.dto.js';

const HOTELS_CACHE_KEY = 'hotels:all';
const HOTELS_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateHotelRequestDto): Promise<HotelResponseDto> {
    try {
      const hotel = this.hotelRepository.create(dto);
      const saved = await this.hotelRepository.save(hotel);
      this.logger.log(`Hotel criado: ${saved.name} (${saved.id})`);

      await this.cacheManager.del(HOTELS_CACHE_KEY);
      this.logger.debug(
        'Cache Invalidation: Cache de hoteis invalidado apos criacao',
      );

      return this.toResponseDto(saved);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === '23505') {
          throw new ConflictException(
            'Já existe um hotel cadastrado com estes dados.',
          );
        }
      }
      this.logger.error('Erro inesperado ao salvar hotel', error);
      throw error;
    }
  }

  async findAll(): Promise<HotelResponseDto[]> {
    const cached =
      await this.cacheManager.get<HotelResponseDto[]>(HOTELS_CACHE_KEY);
    if (cached) {
      this.logger.debug('Cache Hit: Hoteis encontrados no cache');
      return cached;
    }

    const hotels = await this.hotelRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    const result = hotels.map((hotel) => this.toResponseDto(hotel));

    await this.cacheManager.set(HOTELS_CACHE_KEY, result, HOTELS_CACHE_TTL);
    this.logger.debug('Cache Miss: Hoteis armazenados no cache');

    return result;
  }

  async findById(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id, isActive: true },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel com ID ${id} nao encontrado`);
    }

    return hotel;
  }

  private toResponseDto(hotel: Hotel): HotelResponseDto {
    return new HotelResponseDto({
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      state: hotel.state,
      address: hotel.address,
      totalRooms: hotel.totalRooms,
      starsRating: hotel.starsRating,
      description: hotel.description,
      phone: hotel.phone,
      email: hotel.email,
      isActive: hotel.isActive,
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt,
    });
  }
}
