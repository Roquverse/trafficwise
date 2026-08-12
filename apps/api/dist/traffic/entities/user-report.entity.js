"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReport = exports.ReportType = void 0;
const typeorm_1 = require("typeorm");
const road_segment_entity_1 = require("./road-segment.entity");
var ReportType;
(function (ReportType) {
    ReportType["ACCIDENT"] = "Accident";
    ReportType["POTHOLE"] = "Pothole";
    ReportType["HEAVY_TRAFFIC"] = "HeavyTraffic";
    ReportType["FLOOD"] = "Flood";
})(ReportType || (exports.ReportType = ReportType = {}));
let UserReport = class UserReport {
    id;
    user_id;
    segment_id;
    segment;
    timestamp;
    report_type;
};
exports.UserReport = UserReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], UserReport.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], UserReport.prototype, "segment_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => road_segment_entity_1.RoadSegment),
    (0, typeorm_1.JoinColumn)({ name: 'segment_id' }),
    __metadata("design:type", road_segment_entity_1.RoadSegment)
], UserReport.prototype, "segment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserReport.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReportType,
    }),
    __metadata("design:type", String)
], UserReport.prototype, "report_type", void 0);
exports.UserReport = UserReport = __decorate([
    (0, typeorm_1.Entity)('user_report')
], UserReport);
//# sourceMappingURL=user-report.entity.js.map