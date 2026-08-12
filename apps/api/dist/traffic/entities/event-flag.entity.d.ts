import { RoadSegment } from './road-segment.entity';
export declare enum EventType {
    ACCIDENT = "Accident",
    ROADWORKS = "Roadworks",
    EVENT = "Event"
}
export declare class EventFlag {
    id: string;
    segment_id: string;
    segment: RoadSegment;
    timestamp: Date;
    type: EventType;
    description: string;
}
