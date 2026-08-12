import { RoadSegment } from './road-segment.entity';
export declare enum CongestionLevel {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}
export declare class Prediction {
    id: string;
    segment_id: string;
    segment: RoadSegment;
    generated_at: Date;
    horizon_minutes: number;
    congestion_level: CongestionLevel;
    confidence: number;
    model_version: string;
}
