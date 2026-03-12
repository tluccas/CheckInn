import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';
import { Guest } from './entities/guest.entity';
import { ReservationsModule } from '../reservations/reservations.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Guest]), ReservationsModule],
  controllers: [GuestsController],
  providers: [GuestsService],
})
export class GuestsModule {}
