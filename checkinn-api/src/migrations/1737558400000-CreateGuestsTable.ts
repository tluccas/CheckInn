import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateGuestsTable1737558400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'guests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'document',
            type: 'varchar',
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['CPF', 'PASSPORT'],
            default: "'CPF'",
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reservation_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // foreign key para reservations
    await queryRunner.createForeignKey(
      'guests',
      new TableForeignKey({
        columnNames: ['reservation_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'reservations',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('guests');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('reservation_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('guests', foreignKey);
      }
    }
    await queryRunner.dropTable('guests');
  }
}
