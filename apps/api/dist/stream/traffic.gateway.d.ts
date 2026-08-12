import { Server, Socket } from 'socket.io';
import { TrafficService } from '../traffic/services/traffic.service';
export declare class TrafficGateway {
    private readonly trafficService;
    server: Server;
    constructor(trafficService: TrafficService);
    handleSubscribe(data: {
        segmentIds?: string[];
        bbox?: any;
    }, client: Socket): {
        status: string;
        segmentIds: string[];
    } | {
        status: string;
        segmentIds?: undefined;
    };
    broadcastCongestionUpdate(segmentId: string, newCongestionLevel: string, confidence: number): void;
    broadcastAlert(userId: string, message: string): void;
}
