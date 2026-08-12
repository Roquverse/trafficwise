import { TrafficService } from '../services/traffic.service';
export declare class TrafficController {
    private readonly trafficService;
    constructor(trafficService: TrafficService);
    getSegments(): Promise<{
        id: string;
        name: string;
        geometry: import("typeorm").Geometry;
        current_congestion: import("../entities/prediction.entity").CongestionLevel;
        confidence: number;
    }[]>;
    getSegmentDetails(id: string): Promise<{
        segment: import("../entities/road-segment.entity").RoadSegment | null;
        predictions: import("../entities/prediction.entity").Prediction[];
        reports: import("../entities/user-report.entity").UserReport[];
    }>;
    getActiveAlerts(dest?: string): Promise<{
        segmentName: string;
        prediction: any;
        severity: any;
        source: string;
        timestamp: string;
    }[]>;
    reportIncident(req: any, body: any): Promise<import("../entities/user-report.entity").UserReport>;
    getSystemHealth(): Promise<{
        ingestion_status: string;
        model_version: string;
        last_retrain_time: string;
    }>;
}
