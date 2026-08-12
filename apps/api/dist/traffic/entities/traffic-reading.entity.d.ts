import { RoadSegment } from './road-segment.entity';
export declare enum SourceType {
    SYNTHETIC = "Synthetic",
    SENSOR = "Sensor",
    CCTV = "CCTV"
}
export declare class TrafficReading {
    id: string;
    segment_id: string;
    segment: RoadSegment;
    timestamp: Date;
    avg_speed: number;
    vehicle_count: number;
    occupancy: number;
    source_type: SourceType;
}
