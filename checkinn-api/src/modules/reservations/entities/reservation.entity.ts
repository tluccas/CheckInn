import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity.js';
import { Guest } from '../../guests/entities/guest.entity.js';
import { ReservationStatus } from '../enums/status.enum.js';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @Column({ name: 'hotel_id' })
  hotelId: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate: string;

  @Column({ name: 'check_out_date', type: 'date' })
  checkOutDate: string;

  @Column({ name: 'responsible_name' })
  responsibleName: string; // Nome do responsável pela reserva

  @Column({ name: 'responsible_email', nullable: true })
  responsibleEmail: string;

  @Column({ name: 'responsible_phone', nullable: true })
  responsiblePhone: string;

  @Column({ name: 'room_count', type: 'int', default: 1 })
  roomCount: number; // Qtd de quartos reservados

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.CONFIRMED,
  })
  status: ReservationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Guest, (guest) => guest.reservation)
  guests: Guest[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
