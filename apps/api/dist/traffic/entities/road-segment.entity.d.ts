import type { Geometry } from 'typeorm';
export declare enum RoadClass {
    HIGHWAY = "Highway",
    ARTERIAL = "Arterial",
    LOCAL = "Local"
}
export declare class RoadSegment {
    id: string;
    name: string;
    geometry: Geometry;
    lanes: number;
    speed_limit: number;
    road_class: RoadClass;
}
