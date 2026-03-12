import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestsService } from './guests.service.js';
import { Guest } from './entities/guest.entity.js';
import { ReservationsService } from '../reservations/reservations.service.js';
import { DocumentType } from './enums/document-type.enum.js';

describe('GuestsService', () => {
  let service: GuestsService;
  let guestRepository: jest.Mocked<Partial<Repository<Guest>>>;
  let reservationsService: jest.Mocked<Partial<ReservationsService>>;

  const mockGuest: Guest = {
    id: 'guest-uuid-1',
    name: 'Joao Silva',
    document: '12345678900',
    documentType: DocumentType.CPF,
    email: 'joao@email.com',
    phone: '11999999999',
    reservationId: 'reservation-uuid-1',
    reservation: {} as any,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    guestRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    reservationsService = {
      findById: jest.fn().mockResolvedValue({ id: 'reservation-uuid-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestsService,
        { provide: getRepositoryToken(Guest), useValue: guestRepository },
        { provide: ReservationsService, useValue: reservationsService },
      ],
    }).compile();

    service = module.get<GuestsService>(GuestsService);
  });

  describe('create', () => {
    const dto = {
      name: 'Joao Silva',
      document: '12345678900',
      documentType: DocumentType.CPF,
      reservationId: 'reservation-uuid-1',
    };

    it('deve criar hospede com sucesso', async () => {
      (guestRepository.findOne! as any).mockResolvedValue(null);
      (guestRepository.create! as any).mockReturnValue(mockGuest);
      (guestRepository.save! as any).mockResolvedValue(mockGuest);

      const result = await service.create(dto);

      expect(result.id).toBe(mockGuest.id);
      expect(reservationsService.findById).toHaveBeenCalledWith(
        'reservation-uuid-1',
      );
    });

    it('deve lancar ConflictException em documento duplicado na reserva', async () => {
      (guestRepository.findOne! as any).mockResolvedValue(mockGuest);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByReservation', () => {
    it('deve retornar hospedes da reserva', async () => {
      (guestRepository.find! as any).mockResolvedValue([mockGuest]);
      const result = await service.findByReservation('reservation-uuid-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('deve retornar hospede existente', async () => {
      (guestRepository.findOne! as any).mockResolvedValue(mockGuest);
      const result = await service.findById('guest-uuid-1');
      expect(result.id).toBe('guest-uuid-1');
    });

    it('deve lancar NotFoundException quando nao existe', async () => {
      (guestRepository.findOne! as any).mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover hospede com sucesso', async () => {
      (guestRepository.findOne! as any).mockResolvedValue(mockGuest);
      (guestRepository.remove! as any).mockResolvedValue(mockGuest);
      await expect(service.remove('guest-uuid-1')).resolves.not.toThrow();
    });
  });
});
