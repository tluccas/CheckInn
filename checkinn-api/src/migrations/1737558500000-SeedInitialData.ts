import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedInitialData1737558500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verifica se o admin ja existe para evitar duplicação
    const existingAdmin = (await queryRunner.query(
      `SELECT id FROM users WHERE username = 'admin' LIMIT 1;`,
    )) as Array<{ id: string }>;

    if (existingAdmin.length > 0) {
      return;
    }

    // Cria o usuário admin com senha padrão (123456)
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryRunner.query(
      `INSERT INTO users (id, username, password, "isActive", "createdAt", "updatedAt") 
       VALUES (uuid_generate_v4(), $1, $2, $3, now(), now());`,
      ['admin', hashedPassword, true],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE username = 'admin';`);
  }
}
