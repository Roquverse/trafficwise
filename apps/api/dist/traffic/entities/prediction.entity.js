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
exports.Prediction = exports.CongestionLevel = void 0;
const typeorm_1 = require("typeorm");
const road_segment_entity_1 = require("./road-segment.entity");
var CongestionLevel;
(function (CongestionLevel) {
    CongestionLevel["LOW"] = "Low";
    CongestionLevel["MEDIUM"] = "Medium";
    CongestionLevel["HIGH"] = "High";
})(CongestionLevel || (exports.CongestionLevel = CongestionLevel = {}));
let Prediction = class Prediction {
    id;
    segment_id;
    segment;
    generated_at;
    horizon_minutes;
    congestion_level;
    confidence;
    model_version;
};
exports.Prediction = Prediction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Prediction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Prediction.prototype, "segment_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => road_segment_entity_1.RoadSegment),
    (0, typeorm_1.JoinColumn)({ name: 'segment_id' }),
    __metadata("design:type", road_segment_entity_1.RoadSegment)
], Prediction.prototype, "segment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Prediction.prototype, "generated_at", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Prediction.prototype, "horizon_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CongestionLevel,
    }),
    __metadata("design:type", String)
], Prediction.prototype, "congestion_level", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Prediction.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Prediction.prototype, "model_version", void 0);
exports.Prediction = Prediction = __decorate([
    (0, typeorm_1.Entity)('prediction')
], Prediction);
//# sourceMappingURL=prediction.entity.js.map