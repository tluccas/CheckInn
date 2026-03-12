import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto.js';
import { ReservationResponseDto } from './dto/reservation-response.dto.js';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateReservationRequestDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.create(dto);
  }

  @Get()
  async findAll(): Promise<ReservationResponseDto[]> {
    return this.reservationsService.findAll();
  }
}
