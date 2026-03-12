import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateReservationsTable1737558300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reservations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'hotel_id',
            type: 'uuid',
          },
          {
            name: 'check_in_date',
            type: 'date',
          },
          {
            name: 'check_out_date',
            type: 'date',
          },
          {
            name: 'responsible_name',
            type: 'varchar',
          },
          {
            name: 'responsible_email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'responsible_phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'room_count',
            type: 'int',
            default: 1,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'],
            default: "'CONFIRMED'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
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

    // foreign key para hotels
    await queryRunner.createForeignKey(
      'reservations',
      new TableForeignKey({
        columnNames: ['hotel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hotels',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('reservations');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('hotel_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('reservations', foreignKey);
      }
    }
    await queryRunner.dropTable('reservations');
  }
}
