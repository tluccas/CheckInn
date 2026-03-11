export class LoginResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: string;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
