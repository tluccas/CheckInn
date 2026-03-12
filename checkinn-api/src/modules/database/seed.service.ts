import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      this.logger.log('Usuário admin já existe, seed ignorado');
      return;
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = this.userRepository.create({
      username: 'admin',
      password: hashedPassword,
      isActive: true,
    });

    await this.userRepository.save(admin);
    this.logger.log('[SEEDER] Usuário admin criado com sucesso (admin/123456)');
  }
}
