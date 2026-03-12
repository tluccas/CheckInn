import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GuestsService } from './guests.service.js';
import { CreateGuestRequestDto } from './dto/create-guest-request.dto.js';
import { UpdateGuestRequestDto } from './dto/update-guest-request.dto.js';
import { GuestResponseDto } from './dto/guest-response.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Guests')
@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo hóspede vinculado a uma reserva' })
  @ApiResponse({ status: 201, type: GuestResponseDto })
  async create(@Body() dto: CreateGuestRequestDto): Promise<GuestResponseDto> {
    return this.guestsService.create(dto);
  }

  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Lista hóspedes de uma reserva específica' })
  @ApiResponse({ status: 200, type: [GuestResponseDto] })
  async findByReservation(
    @Param('reservationId', new ParseUUIDPipe()) reservationId: string,
  ): Promise<GuestResponseDto[]> {
    return this.guestsService.findByReservation(reservationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um hóspede pelo ID' })
  @ApiResponse({ status: 200, type: GuestResponseDto })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<GuestResponseDto> {
    return this.guestsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza dados de um hóspede' })
  @ApiResponse({ status: 200, type: GuestResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGuestRequestDto,
  ): Promise<GuestResponseDto> {
    return this.guestsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um hóspede' })
  @ApiResponse({ status: 204, description: 'Hóspede removido com sucesso' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.guestsService.remove(id);
  }
}
