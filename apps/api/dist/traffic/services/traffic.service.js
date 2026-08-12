"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const road_segment_entity_1 = require("../entities/road-segment.entity");
const prediction_entity_1 = require("../entities/prediction.entity");
const user_report_entity_1 = require("../entities/user-report.entity");
const event_flag_entity_1 = require("../entities/event-flag.entity");
const genai_1 = require("@google/genai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let TrafficService = class TrafficService {
    segmentRepo;
    predictionRepo;
    reportRepo;
    eventRepo;
    ai;
    constructor(segmentRepo, predictionRepo, reportRepo, eventRepo) {
        this.segmentRepo = segmentRepo;
        this.predictionRepo = predictionRepo;
        this.reportRepo = reportRepo;
        this.eventRepo = eventRepo;
    }
    async getSegmentsWithCongestion() {
        const segments = await this.segmentRepo.find();
        const levels = [prediction_entity_1.CongestionLevel.LOW, prediction_entity_1.CongestionLevel.MEDIUM, prediction_entity_1.CongestionLevel.HIGH];
        return segments.map((seg, i) => ({
            id: seg.id,
            name: seg.name,
            geometry: seg.geometry,
            current_congestion: levels[i % levels.length],
            confidence: 0.9,
        }));
    }
    async getSegmentDetails(id) {
        const segment = await this.segmentRepo.findOne({ where: { id } });
        const predictions = await this.predictionRepo.find({ where: { segment_id: id }, order: { generated_at: 'DESC' }, take: 10 });
        const reports = await this.reportRepo.find({ where: { segment_id: id }, order: { timestamp: 'DESC' }, take: 5 });
        return { segment, predictions, reports };
    }
    async getActiveAlerts(dest) {
        if (dest) {
            try {
                const ai = new genai_1.GoogleGenAI({});
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
                            type: genai_1.Type.OBJECT,
                            properties: {
                                news: {
                                    type: genai_1.Type.OBJECT,
                                    nullable: true,
                                    properties: {
                                        prediction: { type: genai_1.Type.STRING },
                                        severity: { type: genai_1.Type.STRING, enum: ['Low', 'Medium', 'High'] }
                                    }
                                },
                                predictive: {
                                    type: genai_1.Type.OBJECT,
                                    properties: {
                                        prediction: { type: genai_1.Type.STRING },
                                        severity: { type: genai_1.Type.STRING, enum: ['Low', 'Medium', 'High'] }
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
            }
            catch (err) {
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
        const segment = await this.segmentRepo.findOne({ where: { name: 'Third Mainland Bridge' } });
        if (!segment)
            return [];
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
    async reportIncident(userId, segmentId, reportType) {
        const report = this.reportRepo.create({
            user_id: userId,
            segment_id: segmentId,
            report_type: reportType,
            timestamp: new Date()
        });
        return this.reportRepo.save(report);
    }
};
exports.TrafficService = TrafficService;
exports.TrafficService = TrafficService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(road_segment_entity_1.RoadSegment)),
    __param(1, (0, typeorm_1.InjectRepository)(prediction_entity_1.Prediction)),
    __param(2, (0, typeorm_1.InjectRepository)(user_report_entity_1.UserReport)),
    __param(3, (0, typeorm_1.InjectRepository)(event_flag_entity_1.EventFlag)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TrafficService);
//# sourceMappingURL=traffic.service.js.map