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
exports.TrafficReading = exports.SourceType = void 0;
const typeorm_1 = require("typeorm");
const road_segment_entity_1 = require("./road-segment.entity");
var SourceType;
(function (SourceType) {
    SourceType["SYNTHETIC"] = "Synthetic";
    SourceType["SENSOR"] = "Sensor";
    SourceType["CCTV"] = "CCTV";
})(SourceType || (exports.SourceType = SourceType = {}));
let TrafficReading = class TrafficReading {
    id;
    segment_id;
    segment;
    timestamp;
    avg_speed;
    vehicle_count;
    occupancy;
    source_type;
};
exports.TrafficReading = TrafficReading;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TrafficReading.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], TrafficReading.prototype, "segment_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => road_segment_entity_1.RoadSegment),
    (0, typeorm_1.JoinColumn)({ name: 'segment_id' }),
    __metadata("design:type", road_segment_entity_1.RoadSegment)
], TrafficReading.prototype, "segment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TrafficReading.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], TrafficReading.prototype, "avg_speed", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], TrafficReading.prototype, "vehicle_count", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], TrafficReading.prototype, "occupancy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SourceType,
        default: SourceType.SYNTHETIC,
    }),
    __metadata("design:type", String)
], TrafficReading.prototype, "source_type", void 0);
exports.TrafficReading = TrafficReading = __decorate([
    (0, typeorm_1.Entity)('traffic_reading')
], TrafficReading);
//# sourceMappingURL=traffic-reading.entity.js.map