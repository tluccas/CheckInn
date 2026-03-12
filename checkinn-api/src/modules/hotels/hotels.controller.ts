import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HotelsService } from './hotels.service.js';
import { CreateHotelRequestDto } from './dto/create-hotel-request.dto.js';
import { UpdateHotelRequestDto } from './dto/update-hotel-request.dto.js';
import { HotelResponseDto } from './dto/hotel-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo hotel' })
  @ApiResponse({ status: 201, type: HotelResponseDto })
  async create(@Body() dto: CreateHotelRequestDto): Promise<HotelResponseDto> {
    return this.hotelsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista hotéis com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de hotéis',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<HotelResponseDto>> {
    return this.hotelsService.findAll(query);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza dados de um hotel existente' })
  @ApiResponse({ status: 200, type: HotelResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHotelRequestDto,
  ): Promise<HotelResponseDto> {
    return this.hotelsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um hotel' })
  @ApiResponse({ status: 204, description: 'Hotel removido com sucesso' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.hotelsService.remove(id);
  }
}
