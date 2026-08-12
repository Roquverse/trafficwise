import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadSegment } from '../entities/road-segment.entity';
import { Prediction, CongestionLevel } from '../entities/prediction.entity';
import { UserReport } from '../entities/user-report.entity';
import { EventFlag } from '../entities/event-flag.entity';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TrafficService {
  private ai: GoogleGenAI;

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
    
    // Return mapping with mock varying congestion levels for demonstration
    const levels = [CongestionLevel.LOW, CongestionLevel.MEDIUM, CongestionLevel.HIGH];
    return segments.map((seg, i) => ({
      id: seg.id,
      name: seg.name,
      geometry: seg.geometry,
      current_congestion: levels[i % levels.length], // vary congestion
      confidence: 0.9,
    }));
  }

  async getSegmentDetails(id: string) {
    const segment = await this.segmentRepo.findOne({ where: { id } });
    const predictions = await this.predictionRepo.find({ where: { segment_id: id }, order: { generated_at: 'DESC' }, take: 10 });
    const reports = await this.reportRepo.find({ where: { segment_id: id }, order: { timestamp: 'DESC' }, take: 5 });
    
    return { segment, predictions, reports };
  }
  
  async getActiveAlerts(dest?: string) {
    if (dest) {
      try {
        const ai = new GoogleGenAI({});
        
        // Stream of raw "news" and "social media" posts
        const rawNewsStream = `
          - @Gidi_Traffic (Just now): Massive trailer breakdown on the expressway heading to Oshodi. Expect severe delays.
          - Punch News (15m ago): Flash floods reported along Lekki-Epe expressway causing slow moving traffic.
          - @TrafficChiefNG (1h ago): Third mainland bridge is completely free right now.
          - @LagosUpdates (5m ago): Minor accident at Ikeja underbridge, but LASTMA is clearing it up.
          - Vanguard (2h ago): Roadworks on Ikorodu road are causing bottlenecks near Maryland.
        `;

        const prompt = `
          You are an AI Traffic Analyst for Lagos, Nigeria. 
          Analyze the following raw news/social media stream and extract any traffic incidents relevant to a commuter traveling to "${dest}".
          
          You must return a JSON object with two fields:
          1. "news": If there is a relevant news incident from the stream, summarize it and classify its severity. If none, return null.
          2. "predictive": Based on the destination "${dest}" and general traffic patterns, generate a realistic predictive AI traffic forecast (e.g. "Our AI models predict a 25-minute delay due to congestion"). Classify its severity.

          Raw Stream:
          ${rawNewsStream}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                news: { 
                  type: Type.OBJECT, 
                  nullable: true,
                  properties: {
                    prediction: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                  }
                },
                predictive: { 
                  type: Type.OBJECT, 
                  properties: {
                    prediction: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                  }
                }
              },
              required: ["predictive"]
            }
          }
        });
        
        const result = JSON.parse(response.text || '{}');
        const alerts = [];

        if (result.news) {
          alerts.push({
            segmentName: `Routes to ${dest}`,
            prediction: result.news.prediction,
            severity: result.news.severity,
            source: 'news',
            timestamp: new Date().toISOString()
          });
        }

        if (result.predictive) {
          alerts.push({
            segmentName: `Routes to ${dest}`,
            prediction: result.predictive.prediction,
            severity: result.predictive.severity,
            source: 'model',
            timestamp: new Date().toISOString()
          });
        }

        return alerts;
      } catch (err) {
        console.error("Gemini AI Error:", err);
        return [{
          segmentName: `Routes to ${dest}`,
          prediction: `Our models predict a 20-minute delay forming on major roads heading to ${dest} due to increased volume.`,
          severity: 'High',
          source: 'model',
          timestamp: new Date().toISOString()
        }];
      }
    }
    
    // Default alert if no destination
    const segment = await this.segmentRepo.findOne({ where: { name: 'Third Mainland Bridge' } });
    if (!segment) return [];
    return [{
      segmentName: segment.name,
      prediction: '45-minute jam forming in the next 15 minutes due to an accident ahead.',
      severity: 'High',
      source: 'model',
      timestamp: new Date().toISOString()
    }];
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
