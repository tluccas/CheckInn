import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginRequestDto } from './dto/login-request.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza login e retorna token JWT' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}
