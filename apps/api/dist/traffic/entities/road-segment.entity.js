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
exports.RoadSegment = exports.RoadClass = void 0;
const typeorm_1 = require("typeorm");
var RoadClass;
(function (RoadClass) {
    RoadClass["HIGHWAY"] = "Highway";
    RoadClass["ARTERIAL"] = "Arterial";
    RoadClass["LOCAL"] = "Local";
})(RoadClass || (exports.RoadClass = RoadClass = {}));
let RoadSegment = class RoadSegment {
    id;
    name;
    geometry;
    lanes;
    speed_limit;
    road_class;
};
exports.RoadSegment = RoadSegment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoadSegment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoadSegment.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geometry',
        spatialFeatureType: 'LineString',
        srid: 4326,
    }),
    __metadata("design:type", Object)
], RoadSegment.prototype, "geometry", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], RoadSegment.prototype, "lanes", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], RoadSegment.prototype, "speed_limit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RoadClass,
        default: RoadClass.LOCAL,
    }),
    __metadata("design:type", String)
], RoadSegment.prototype, "road_class", void 0);
exports.RoadSegment = RoadSegment = __decorate([
    (0, typeorm_1.Entity)('road_segment')
], RoadSegment);
//# sourceMappingURL=road-segment.entity.js.map