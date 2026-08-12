import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import type { Geometry } from 'typeorm';

@Entity('weather_snapshot')
export class WeatherSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Geometry;

  @Column()
  condition: string;

  @Column('float')
  precipitation: number;
}
