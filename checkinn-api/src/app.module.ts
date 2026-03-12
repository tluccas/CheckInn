import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';

import { AuthModule } from './modules/auth/auth.module';
import { HotelsModule } from './modules/hotels/hotels.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { GuestsModule } from './modules/guests/guests.module';
import { DatabaseModule } from './modules/database/database.module';
import { RedisCacheModule } from './modules/cache/redis-cache.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),

        autoLoadEntities: true,
        // Synchronize apenas em dev
        synchronize:
          process.env.NODE_ENV === 'development' ||
          process.env.TYPEORM_SYNCHRONIZE === 'true',
        // Migrations em produção
        migrationsRun: process.env.NODE_ENV === 'production',
        migrations: ['dist/src/migrations/*{.ts,.js}'],
        logging: process.env.NODE_ENV === 'development',
      }),
    }),

    RedisCacheModule,

    AuthModule,
    HotelsModule,
    ReservationsModule,
    GuestsModule,
    DatabaseModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
