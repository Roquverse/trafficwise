import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoadSegment } from './road-segment.entity';

export enum ReportType {
  ACCIDENT = 'Accident',
  POTHOLE = 'Pothole',
  HEAVY_TRAFFIC = 'HeavyTraffic',
  FLOOD = 'Flood',
}

@Entity('user_report')
export class UserReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mock user_id for now (would link to a User entity if we had one)
  @Column('uuid')
  user_id: string;

  @Column('uuid')
  segment_id: string;

  @ManyToOne(() => RoadSegment)
  @JoinColumn({ name: 'segment_id' })
  segment: RoadSegment;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  report_type: ReportType;
}
