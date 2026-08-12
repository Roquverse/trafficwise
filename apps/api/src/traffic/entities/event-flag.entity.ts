import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoadSegment } from './road-segment.entity';

export enum EventType {
  ACCIDENT = 'Accident',
  ROADWORKS = 'Roadworks',
  EVENT = 'Event',
}

@Entity('event_flag')
export class EventFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  segment_id: string;

  @ManyToOne(() => RoadSegment)
  @JoinColumn({ name: 'segment_id' })
  segment: RoadSegment;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column('text')
  description: string;
}
