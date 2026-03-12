import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './entities/guest.entity.js';
import { CreateGuestRequestDto } from './dto/create-guest-request.dto.js';
import { GuestResponseDto } from './dto/guest-response.dto.js';
import { ReservationsService } from '../reservations/reservations.service.js';

@Injectable()
export class GuestsService {
  private readonly logger = new Logger(GuestsService.name);

  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    private readonly reservationsService: ReservationsService,
  ) {}

  async create(dto: CreateGuestRequestDto): Promise<GuestResponseDto> {
    await this.reservationsService.findById(dto.reservationId);

    const existingGuest = await this.guestRepository.findOne({
      where: {
        document: dto.document,
        reservationId: dto.reservationId,
      },
    });

    if (existingGuest) {
      throw new ConflictException(
        'Já existe um hóspede com este documento nesta reserva',
      );
    }

    const guest = this.guestRepository.create(dto);
    const saved = await this.guestRepository.save(guest);
    this.logger.log(`Hóspede cadastrado: ${saved.name} (${saved.id})`);

    return this.toResponseDto(saved);
  }

  async findByReservation(reservationId: string): Promise<GuestResponseDto[]> {
    await this.reservationsService.findById(reservationId);

    const guests = await this.guestRepository.find({
      where: { reservationId },
      order: { createdAt: 'ASC' },
    });

    return guests.map((guest) => this.toResponseDto(guest));
  }

  private toResponseDto(guest: Guest): GuestResponseDto {
    return new GuestResponseDto({
      id: guest.id,
      name: guest.name,
      document: guest.document,
      documentType: guest.documentType,
      email: guest.email,
      phone: guest.phone,
      reservationId: guest.reservationId,
      createdAt: guest.createdAt,
      updatedAt: guest.updatedAt,
    });
  }
}
