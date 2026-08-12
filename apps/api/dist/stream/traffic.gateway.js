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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const traffic_service_1 = require("../traffic/services/traffic.service");
let TrafficGateway = class TrafficGateway {
    trafficService;
    server;
    constructor(trafficService) {
        this.trafficService = trafficService;
    }
    handleSubscribe(data, client) {
        if (data.segmentIds) {
            data.segmentIds.forEach(id => {
                client.join(`segment_${id}`);
            });
            return { status: 'Subscribed to segments', segmentIds: data.segmentIds };
        }
        return { status: 'Invalid subscription request' };
    }
    broadcastCongestionUpdate(segmentId, newCongestionLevel, confidence) {
        this.server.to(`segment_${segmentId}`).emit('congestion_update', {
            segmentId,
            newCongestionLevel,
            confidence,
            timestamp: new Date().toISOString()
        });
    }
    broadcastAlert(userId, message) {
        this.server.to(`user_${userId}`).emit('alert', {
            message,
            timestamp: new Date().toISOString()
        });
    }
};
exports.TrafficGateway = TrafficGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrafficGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrafficGateway.prototype, "handleSubscribe", null);
exports.TrafficGateway = TrafficGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/traffic-stream',
    }),
    __metadata("design:paramtypes", [traffic_service_1.TrafficService])
], TrafficGateway);
//# sourceMappingURL=traffic.gateway.js.map