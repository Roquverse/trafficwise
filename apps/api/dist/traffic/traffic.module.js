"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const traffic_service_1 = require("./services/traffic.service");
const traffic_controller_1 = require("./controllers/traffic.controller");
const road_segment_entity_1 = require("./entities/road-segment.entity");
const traffic_reading_entity_1 = require("./entities/traffic-reading.entity");
const weather_snapshot_entity_1 = require("./entities/weather-snapshot.entity");
const event_flag_entity_1 = require("./entities/event-flag.entity");
const prediction_entity_1 = require("./entities/prediction.entity");
const user_report_entity_1 = require("./entities/user-report.entity");
let TrafficModule = class TrafficModule {
};
exports.TrafficModule = TrafficModule;
exports.TrafficModule = TrafficModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                road_segment_entity_1.RoadSegment,
                traffic_reading_entity_1.TrafficReading,
                weather_snapshot_entity_1.WeatherSnapshot,
                event_flag_entity_1.EventFlag,
                prediction_entity_1.Prediction,
                user_report_entity_1.UserReport,
            ]),
        ],
        providers: [traffic_service_1.TrafficService],
        controllers: [traffic_controller_1.TrafficController],
        exports: [traffic_service_1.TrafficService],
    })
], TrafficModule);
//# sourceMappingURL=traffic.module.js.map