import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto.js';
import { ReservationResponseDto } from './dto/reservation-response.dto.js';
import { HotelsService } from '../hotels/hotels.service.js';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly hotelsService: HotelsService,
  ) {}

  async create(
    dto: CreateReservationRequestDto,
  ): Promise<ReservationResponseDto> {
    const hotel = await this.hotelsService.findById(dto.hotelId);

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'A data de check-out deve ser posterior a data de check-in',
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new BadRequestException(
        'A data de check-in nao pode ser no passado',
      );
    }

    const roomCount = dto.roomCount || 1;
    if (roomCount > hotel.totalRooms) {
      throw new BadRequestException(
        `O hotel possui apenas ${hotel.totalRooms} quartos. Solicitado: ${roomCount}`,
      );
    }

    const reservation = this.reservationRepository.create({
      ...dto,
      roomCount,
    });

    const saved = await this.reservationRepository.save(reservation);
    this.logger.log(`Reserva criada: ${saved.id} no hotel ${hotel.name}`);

    const full = await this.reservationRepository.findOne({
      where: { id: saved.id },
      relations: ['hotel', 'guests'],
    });

    return this.toResponseDto(full!);
  }

  async findAll(): Promise<ReservationResponseDto[]> {
    const reservations = await this.reservationRepository.find({
      relations: ['hotel', 'guests'],
      order: { createdAt: 'DESC' },
    });

    return reservations.map((r) => this.toResponseDto(r));
  }

  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['hotel', 'guests'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva com ID ${id} nao encontrada`);
    }

    return reservation;
  }

  private toResponseDto(reservation: Reservation): ReservationResponseDto {
    return new ReservationResponseDto({
      id: reservation.id,
      hotelId: reservation.hotelId,
      hotel: reservation.hotel
        ? {
            id: reservation.hotel.id,
            name: reservation.hotel.name,
            city: reservation.hotel.city,
            state: reservation.hotel.state,
            address: reservation.hotel.address,
            totalRooms: reservation.hotel.totalRooms,
            starsRating: reservation.hotel.starsRating,
            description: reservation.hotel.description,
            phone: reservation.hotel.phone,
            email: reservation.hotel.email,
            isActive: reservation.hotel.isActive,
            createdAt: reservation.hotel.createdAt,
            updatedAt: reservation.hotel.updatedAt,
          }
        : undefined,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      responsibleName: reservation.responsibleName,
      responsibleEmail: reservation.responsibleEmail,
      responsiblePhone: reservation.responsiblePhone,
      roomCount: reservation.roomCount,
      status: reservation.status,
      notes: reservation.notes,
      guestCount: reservation.guests?.length || 0,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    });
  }
}
