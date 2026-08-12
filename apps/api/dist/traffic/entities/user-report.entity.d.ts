import { RoadSegment } from './road-segment.entity';
export declare enum ReportType {
    ACCIDENT = "Accident",
    POTHOLE = "Pothole",
    HEAVY_TRAFFIC = "HeavyTraffic",
    FLOOD = "Flood"
}
export declare class UserReport {
    id: string;
    user_id: string;
    segment_id: string;
    segment: RoadSegment;
    timestamp: Date;
    report_type: ReportType;
}
