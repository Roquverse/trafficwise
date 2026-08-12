import { Repository } from 'typeorm';
import { RoadSegment } from '../entities/road-segment.entity';
import { Prediction, CongestionLevel } from '../entities/prediction.entity';
import { UserReport } from '../entities/user-report.entity';
import { EventFlag } from '../entities/event-flag.entity';
export declare class TrafficService {
    private segmentRepo;
    private predictionRepo;
    private reportRepo;
    private eventRepo;
    private ai;
    constructor(segmentRepo: Repository<RoadSegment>, predictionRepo: Repository<Prediction>, reportRepo: Repository<UserReport>, eventRepo: Repository<EventFlag>);
    getSegmentsWithCongestion(): Promise<{
        id: string;
        name: string;
        geometry: import("typeorm").Geometry;
        current_congestion: CongestionLevel;
        confidence: number;
    }[]>;
    getSegmentDetails(id: string): Promise<{
        segment: RoadSegment | null;
        predictions: Prediction[];
        reports: UserReport[];
    }>;
    getActiveAlerts(dest?: string): Promise<{
        segmentName: string;
        prediction: any;
        severity: any;
        source: string;
        timestamp: string;
    }[]>;
    getSystemHealth(): Promise<{
        ingestion_status: string;
        model_version: string;
        last_retrain_time: string;
    }>;
    reportIncident(userId: string, segmentId: string, reportType: any): Promise<UserReport>;
}
