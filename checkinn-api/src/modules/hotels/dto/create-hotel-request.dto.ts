import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateHotelRequestDto {
  @IsNotEmpty({ message: 'O nome do hotel é obrigatório' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'A cidade é obrigatória' })
  @IsString()
  city: string;

  @IsNotEmpty({ message: 'O estado é obrigatório' })
  @IsString()
  state: string;

  @IsNotEmpty({ message: 'O endereço é obrigatório' })
  @IsString()
  address: string;

  @IsNotEmpty({ message: 'A quantidade de quartos é obrigatória' })
  @IsInt({ message: 'A quantidade de quartos deve ser um número inteiro' })
  @Min(1, { message: 'O hotel deve ter pelo menos 1 quarto' })
  totalRooms: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  starsRating?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;
}
