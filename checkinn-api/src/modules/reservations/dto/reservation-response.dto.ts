import { HotelResponseDto } from '../../hotels/dto/hotel-response.dto.js';
import { ReservationStatus } from '../enums/status.enum.js';

export class ReservationResponseDto {
  id: string;
  hotelId: string;
  hotel?: HotelResponseDto;
  checkInDate: string;
  checkOutDate: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  roomCount: number;
  status: ReservationStatus;
  notes: string;
  guestCount?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ReservationResponseDto>) {
    Object.assign(this, partial);
  }
}
