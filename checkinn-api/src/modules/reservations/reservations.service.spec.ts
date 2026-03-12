import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationsService } from './reservations.service.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationStatus } from './enums/status.enum.js';
import { HotelsService } from '../hotels/hotels.service.js';
import { Hotel } from '../hotels/entities/hotel.entity.js';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationRepository: jest.Mocked<Partial<Repository<Reservation>>>;
  let hotelsService: jest.Mocked<Partial<HotelsService>>;

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

  const mockReservation: Reservation = {
    id: 'reservation-uuid-1',
    hotelId: 'hotel-uuid-1',
    hotel: mockHotel,
    checkInDate: '2027-06-01',
    checkOutDate: '2027-06-05',
    responsibleName: 'Joao Silva',
    responsibleEmail: 'joao@email.com',
    responsiblePhone: '11999999999',
    roomCount: 2,
    status: ReservationStatus.CONFIRMED,
    notes: 'Lua de mel',
    guests: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    reservationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };
    hotelsService = { findById: jest.fn().mockResolvedValue(mockHotel) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationRepository,
        },
        { provide: HotelsService, useValue: hotelsService },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('create', () => {
    const dto = {
      hotelId: 'hotel-uuid-1',
      checkInDate: '2027-06-01',
      checkOutDate: '2027-06-05',
      responsibleName: 'Joao Silva',
      roomCount: 2,
    };

    it('deve criar reserva com sucesso', async () => {
      (reservationRepository.create! as any).mockReturnValue(mockReservation);
      (reservationRepository.save! as any).mockResolvedValue(mockReservation);
      (reservationRepository.findOne! as any).mockResolvedValue(
        mockReservation,
      );

      const result = await service.create(dto);

      expect(result.id).toBe('reservation-uuid-1');
      expect(hotelsService.findById).toHaveBeenCalledWith('hotel-uuid-1');
    });
    it('deve lancar BadRequestException quando check-out antes do check-in', async () => {
      await expect(
        service.create({
          ...dto,
          checkInDate: '2027-06-05',
          checkOutDate: '2027-06-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lancar BadRequestException quando check-in no passado', async () => {
      await expect(
        service.create({
          ...dto,
          checkInDate: '2020-01-01',
          checkOutDate: '2020-01-05',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('deve retornar reservas paginadas', async () => {
      (reservationRepository.findAndCount! as any).mockResolvedValue([
        [mockReservation],
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe('findById', () => {
    it('deve retornar reserva existente', async () => {
      (reservationRepository.findOne! as any).mockResolvedValue(
        mockReservation,
      );
      const result = await service.findById('reservation-uuid-1');
      expect(result).toEqual(mockReservation);
    });

    it('deve lancar NotFoundException quando nao existe', async () => {
      (reservationRepository.findOne! as any).mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('deve permitir transicao CONFIRMED para CHECKED_IN', async () => {
      const checkedIn = {
        ...mockReservation,
        status: ReservationStatus.CHECKED_IN,
      };
      (reservationRepository.findOne! as any)
        .mockResolvedValueOnce({ ...mockReservation })
        .mockResolvedValueOnce(checkedIn);
      (reservationRepository.save! as any).mockResolvedValue(checkedIn);

      const result = await service.updateStatus('reservation-uuid-1', {
        status: ReservationStatus.CHECKED_IN,
      });

      expect(result.status).toBe(ReservationStatus.CHECKED_IN);
    });

    it('deve rejeitar transicao invalida', async () => {
      (reservationRepository.findOne! as any).mockResolvedValue({
        ...mockReservation,
      });
      await expect(
        service.updateStatus('reservation-uuid-1', {
          status: ReservationStatus.CHECKED_OUT,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover reserva com sucesso', async () => {
      (reservationRepository.findOne! as any).mockResolvedValue({
        ...mockReservation,
      });
      (reservationRepository.remove! as any).mockResolvedValue(mockReservation);
      await expect(service.remove('reservation-uuid-1')).resolves.not.toThrow();
    });

    it('deve rejeitar remocao de reserva com check-in ativo', async () => {
      const checkedIn = {
        ...mockReservation,
        status: ReservationStatus.CHECKED_IN,
      };
      (reservationRepository.findOne! as any).mockResolvedValue(checkedIn);
      await expect(service.remove('reservation-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
