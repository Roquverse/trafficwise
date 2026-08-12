"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const road_segment_entity_1 = require("./traffic/entities/road-segment.entity");
const traffic_reading_entity_1 = require("./traffic/entities/traffic-reading.entity");
const weather_snapshot_entity_1 = require("./traffic/entities/weather-snapshot.entity");
const event_flag_entity_1 = require("./traffic/entities/event-flag.entity");
const prediction_entity_1 = require("./traffic/entities/prediction.entity");
const user_report_entity_1 = require("./traffic/entities/user-report.entity");
const user_entity_1 = require("./auth/entities/user.entity");
const auth_module_1 = require("./auth/auth.module");
const traffic_module_1 = require("./traffic/traffic.module");
const stream_module_1 = require("./stream/stream.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5433', 10),
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'trafficwise',
                entities: [
                    road_segment_entity_1.RoadSegment,
                    traffic_reading_entity_1.TrafficReading,
                    weather_snapshot_entity_1.WeatherSnapshot,
                    event_flag_entity_1.EventFlag,
                    prediction_entity_1.Prediction,
                    user_report_entity_1.UserReport,
                    user_entity_1.User,
                ],
                synchronize: true,
            }),
            auth_module_1.AuthModule,
            traffic_module_1.TrafficModule,
            stream_module_1.StreamModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map