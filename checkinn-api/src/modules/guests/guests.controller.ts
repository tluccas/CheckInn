import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GuestsService } from './guests.service.js';
import { CreateGuestRequestDto } from './dto/create-guest-request.dto.js';
import { GuestResponseDto } from './dto/guest-response.dto.js';

@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGuestRequestDto): Promise<GuestResponseDto> {
    return this.guestsService.create(dto);
  }

  @Get('reservation/:reservationId')
  async findByReservation(
    @Param('reservationId', new ParseUUIDPipe()) reservationId: string,
  ): Promise<GuestResponseDto[]> {
    return this.guestsService.findByReservation(reservationId);
  }
}
