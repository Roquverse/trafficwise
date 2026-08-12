import type { Geometry } from 'typeorm';
export declare class WeatherSnapshot {
    id: string;
    timestamp: Date;
    location: Geometry;
    condition: string;
    precipitation: number;
}
