import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HotelsService } from './hotels.service.js';
import { CreateHotelRequestDto } from './dto/create-hotel-request.dto.js';
import { HotelResponseDto } from './dto/hotel-response.dto.js';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateHotelRequestDto): Promise<HotelResponseDto> {
    return this.hotelsService.create(dto);
  }

  @Get()
  async findAll(): Promise<HotelResponseDto[]> {
    return this.hotelsService.findAll();
  }
}
