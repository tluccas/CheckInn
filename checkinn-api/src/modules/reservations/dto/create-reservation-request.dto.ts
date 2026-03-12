import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsEmail,
} from 'class-validator';

export class CreateReservationRequestDto {
  @IsNotEmpty({ message: 'O hotel e obrigatorio' })
  @IsUUID('4', { message: 'ID do hotel deve ser um UUID valido' })
  hotelId: string;

  @IsNotEmpty({ message: 'A data de check-in e obrigatoria' })
  @IsDateString(
    {},
    {
      message: 'Data de check-in deve estar no formato ISO (YYYY-MM-DD)',
    },
  )
  checkInDate: string;

  @IsNotEmpty({ message: 'A data de check-out e obrigatoria' })
  @IsDateString(
    {},
    { message: 'Data de check-out deve estar no formato ISO (YYYY-MM-DD)' },
  )
  checkOutDate: string;

  @IsNotEmpty({ message: 'O nome do responsavel e obrigatorio' })
  @IsString()
  responsibleName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email do responsavel invalido' })
  responsibleEmail?: string;

  @IsOptional()
  @IsString()
  responsiblePhone?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'A reserva deve ter pelo menos 1 quarto' })
  roomCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
