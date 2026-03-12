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
import { UpdateReservationRequestDto } from './dto/update-reservation-request.dto.js';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto.js';
import { ReservationResponseDto } from './dto/reservation-response.dto.js';
import { ReservationStatus } from './enums/status.enum.js';
import { HotelsService } from '../hotels/hotels.service.js';
import { MailService } from '../mail/mail.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly hotelsService: HotelsService,
    private readonly mailService: MailService,
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

    // Agendar lembrete 1 dia antes do check-in
    await this.mailService.schedulePreCheckinReminder(
      saved.responsibleEmail,
      saved.responsibleName,
      saved.checkInDate,
    );

    const full = await this.reservationRepository.findOne({
      where: { id: saved.id },
      relations: ['hotel', 'guests'],
    });

    return this.toResponseDto(full!);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReservationResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [reservations, totalItems] =
      await this.reservationRepository.findAndCount({
        relations: ['hotel', 'guests'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    const data = reservations.map((r) => this.toResponseDto(r));
    return new PaginatedResponseDto(data, totalItems, page, limit);
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

  async update(
    id: string,
    dto: UpdateReservationRequestDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.findById(id);

    // Validar datas se fornecidas
    const checkIn = dto.checkInDate
      ? new Date(dto.checkInDate)
      : new Date(reservation.checkInDate);
    const checkOut = dto.checkOutDate
      ? new Date(dto.checkOutDate)
      : new Date(reservation.checkOutDate);

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'A data de check-out deve ser posterior a data de check-in',
      );
    }

    // Validar roomCount se fornecido
    if (dto.roomCount) {
      const hotel = await this.hotelsService.findById(reservation.hotelId);
      if (dto.roomCount > hotel.totalRooms) {
        throw new BadRequestException(
          `O hotel possui apenas ${hotel.totalRooms} quartos. Solicitado: ${dto.roomCount}`,
        );
      }
    }

    Object.assign(reservation, dto);
    const updated = await this.reservationRepository.save(reservation);
    this.logger.log(`Reserva atualizada: ${updated.id}`);

    const full = await this.findById(updated.id);
    return this.toResponseDto(full);
  }

  async updateStatus(
    id: string,
    dto: UpdateReservationStatusDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.findById(id);

    // Regras de transição de status
    const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.CONFIRMED]: [
        ReservationStatus.CHECKED_IN,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.CHECKED_IN]: [ReservationStatus.CHECKED_OUT],
      [ReservationStatus.CHECKED_OUT]: [],
      [ReservationStatus.CANCELLED]: [],
    };

    const allowed = validTransitions[reservation.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Não é possível alterar status de ${reservation.status} para ${dto.status}. ` +
          `Transições permitidas: ${allowed.length > 0 ? allowed.join(', ') : 'nenhuma (status final)'}`,
      );
    }

    reservation.status = dto.status;
    const updated = await this.reservationRepository.save(reservation);
    this.logger.log(
      `Status da reserva ${updated.id} alterado para ${updated.status}`,
    );

    // Simulação de envio de e-mail de check-in via fila
    if (updated.status === ReservationStatus.CHECKED_IN) {
      await this.mailService.scheduleWelcomeEmail(
        updated.responsibleEmail,
        updated.responsibleName,
      );
    }

    const full = await this.findById(updated.id);
    return this.toResponseDto(full);
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findById(id);

    if (reservation.status === ReservationStatus.CHECKED_IN) {
      throw new BadRequestException(
        'Não é possível excluir uma reserva com check-in ativo',
      );
    }

    await this.reservationRepository.remove(reservation);
    this.logger.log(`Reserva removida: ${id}`);
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
