import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadSegment } from '../entities/road-segment.entity';
import { Prediction, CongestionLevel } from '../entities/prediction.entity';
import { UserReport } from '../entities/user-report.entity';
import { EventFlag } from '../entities/event-flag.entity';

@Injectable()
export class TrafficService {
  constructor(
    @InjectRepository(RoadSegment)
    private segmentRepo: Repository<RoadSegment>,
    @InjectRepository(Prediction)
    private predictionRepo: Repository<Prediction>,
    @InjectRepository(UserReport)
    private reportRepo: Repository<UserReport>,
    @InjectRepository(EventFlag)
    private eventRepo: Repository<EventFlag>
  ) {}

  async getSegmentsWithCongestion() {
    // In a real scenario, this would be a spatial query or join with the latest prediction
    const segments = await this.segmentRepo.find();
    
    // Mock mapping for now if DB is empty
    return segments.map(seg => ({
      id: seg.id,
      name: seg.name,
      geometry: seg.geometry,
      current_congestion: CongestionLevel.LOW,
      confidence: 0.9,
    }));
  }

  async getSegmentDetails(id: string) {
    const segment = await this.segmentRepo.findOne({ where: { id } });
    const predictions = await this.predictionRepo.find({ where: { segment_id: id }, order: { generated_at: 'DESC' }, take: 10 });
    const reports = await this.reportRepo.find({ where: { segment_id: id }, order: { timestamp: 'DESC' }, take: 5 });
    
    return { segment, predictions, reports };
  }
  
  async getSystemHealth() {
    return {
      ingestion_status: 'healthy',
      model_version: 'ensemble-v1',
      last_retrain_time: new Date().toISOString()
    };
  }

  async reportIncident(userId: string, segmentId: string, reportType: any) {
    const report = this.reportRepo.create({
      user_id: userId,
      segment_id: segmentId,
      report_type: reportType,
      timestamp: new Date()
    });
    return this.reportRepo.save(report);
  }
}
