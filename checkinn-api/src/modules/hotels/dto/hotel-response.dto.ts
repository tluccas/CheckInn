export class HotelResponseDto {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  totalRooms: number;
  starsRating: number;
  description: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<HotelResponseDto>) {
    Object.assign(this, partial);
  }
}
