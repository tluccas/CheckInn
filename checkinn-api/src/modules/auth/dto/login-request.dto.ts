import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty({ message: 'O username é obrigatório' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  password: string;
}
