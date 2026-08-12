import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoadSegment } from './road-segment.entity';

export enum CongestionLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

@Entity('prediction')
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  segment_id: string;

  @ManyToOne(() => RoadSegment)
  @JoinColumn({ name: 'segment_id' })
  segment: RoadSegment;

  @Column({ type: 'timestamptz' })
  generated_at: Date;

  @Column('int')
  horizon_minutes: number;

  @Column({
    type: 'enum',
    enum: CongestionLevel,
  })
  congestion_level: CongestionLevel;

  @Column('float')
  confidence: number;

  @Column()
  model_version: string;
}
