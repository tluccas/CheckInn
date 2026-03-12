import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExtensionsAndEnums1737558000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ENUM types
    await queryRunner.query(
      `CREATE TYPE "reservation_status" AS ENUM('CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "document_type" AS ENUM('CPF', 'PASSPORT')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE IF EXISTS "document_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reservation_status"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
