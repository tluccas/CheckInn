import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto.js';
import { UpdateReservationRequestDto } from './dto/update-reservation-request.dto.js';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto.js';
import { ReservationResponseDto } from './dto/reservation-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria uma nova reserva' })
  @ApiResponse({ status: 201, type: ReservationResponseDto })
  async create(
    @Body() dto: CreateReservationRequestDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista reservas com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de reservas',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReservationResponseDto>> {
    return this.reservationsService.findAll(query);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza dados de uma reserva' })
  @ApiResponse({ status: 200, type: ReservationResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReservationRequestDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza o status de uma reserva' })
  @ApiResponse({ status: 200, type: ReservationResponseDto })
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma reserva' })
  @ApiResponse({ status: 204, description: 'Reserva removida com sucesso' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.reservationsService.remove(id);
  }
}
