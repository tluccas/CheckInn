import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAdmin = await queryRunner.manager.findOne(User, {
        where: { username: 'admin' },
      });

      if (existingAdmin) {
        this.logger.log('Usuário admin já existe, seed ignorado');
        await queryRunner.rollbackTransaction();
        return;
      }

      const hashedPassword = await bcrypt.hash('123456', 10);

      const admin = queryRunner.manager.create(User, {
        username: 'admin',
        password: hashedPassword,
        isActive: true,
      });

      await queryRunner.manager.save(admin);
      await queryRunner.commitTransaction();

      this.logger.log(
        '[SEEDER] Usuário admin criado com sucesso (admin/123456)',
      );
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        '[SEEDER] Erro ao criar usuário admin:',
        (error as Error).message,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
