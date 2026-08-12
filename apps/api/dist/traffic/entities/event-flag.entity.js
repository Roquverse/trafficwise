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
exports.EventFlag = exports.EventType = void 0;
const typeorm_1 = require("typeorm");
const road_segment_entity_1 = require("./road-segment.entity");
var EventType;
(function (EventType) {
    EventType["ACCIDENT"] = "Accident";
    EventType["ROADWORKS"] = "Roadworks";
    EventType["EVENT"] = "Event";
})(EventType || (exports.EventType = EventType = {}));
let EventFlag = class EventFlag {
    id;
    segment_id;
    segment;
    timestamp;
    type;
    description;
};
exports.EventFlag = EventFlag;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EventFlag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], EventFlag.prototype, "segment_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => road_segment_entity_1.RoadSegment),
    (0, typeorm_1.JoinColumn)({ name: 'segment_id' }),
    __metadata("design:type", road_segment_entity_1.RoadSegment)
], EventFlag.prototype, "segment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], EventFlag.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EventType,
    }),
    __metadata("design:type", String)
], EventFlag.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], EventFlag.prototype, "description", void 0);
exports.EventFlag = EventFlag = __decorate([
    (0, typeorm_1.Entity)('event_flag')
], EventFlag);
//# sourceMappingURL=event-flag.entity.js.map