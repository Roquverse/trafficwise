import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { RoadSegment } from './road-segment.entity';

export enum SourceType {
  SYNTHETIC = 'Synthetic',
  SENSOR = 'Sensor',
  CCTV = 'CCTV',
}

@Entity('traffic_reading')
export class TrafficReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  segment_id: string;

  @ManyToOne(() => RoadSegment)
  @JoinColumn({ name: 'segment_id' })
  segment: RoadSegment;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column('float')
  avg_speed: number;

  @Column('int')
  vehicle_count: number;

  @Column('float')
  occupancy: number;

  @Column({
    type: 'enum',
    enum: SourceType,
    default: SourceType.SYNTHETIC,
  })
  source_type: SourceType;
}
