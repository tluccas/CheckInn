import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { HotelsModule } from '../hotels/hotels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    // Importa o HotelsModule para acessar o HotelsService
    // No Spring, a DI é global. No NestJS, cada módulo tem seu escopo.
    // Você PRECISA importar o módulo que exporta o service que quer usar.
    HotelsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
