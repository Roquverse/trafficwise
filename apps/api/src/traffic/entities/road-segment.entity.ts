import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import type { Geometry } from 'typeorm';

export enum RoadClass {
  HIGHWAY = 'Highway',
  ARTERIAL = 'Arterial',
  LOCAL = 'Local',
}

@Entity('road_segment')
export class RoadSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
  })
  geometry: Geometry;

  @Column('int')
  lanes: number;

  @Column('int')
  speed_limit: number;

  @Column({
    type: 'enum',
    enum: RoadClass,
    default: RoadClass.LOCAL,
  })
  road_class: RoadClass;
}
