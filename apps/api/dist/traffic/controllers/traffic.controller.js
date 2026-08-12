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
exports.TrafficController = void 0;
const common_1 = require("@nestjs/common");
const traffic_service_1 = require("../services/traffic.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
let TrafficController = class TrafficController {
    trafficService;
    constructor(trafficService) {
        this.trafficService = trafficService;
    }
    async getSegments() {
        return this.trafficService.getSegmentsWithCongestion();
    }
    async getSegmentDetails(id) {
        return this.trafficService.getSegmentDetails(id);
    }
    async getActiveAlerts(dest) {
        return this.trafficService.getActiveAlerts(dest);
    }
    async reportIncident(req, body) {
        return this.trafficService.reportIncident(req.user.userId, body.segmentId, body.reportType);
    }
    async getSystemHealth() {
        return this.trafficService.getSystemHealth();
    }
};
exports.TrafficController = TrafficController;
__decorate([
    (0, common_1.Get)('segments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrafficController.prototype, "getSegments", null);
__decorate([
    (0, common_1.Get)('segments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrafficController.prototype, "getSegmentDetails", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)('dest')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrafficController.prototype, "getActiveAlerts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('incident'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TrafficController.prototype, "reportIncident", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.OPS),
    (0, common_1.Get)('system/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrafficController.prototype, "getSystemHealth", null);
exports.TrafficController = TrafficController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [traffic_service_1.TrafficService])
], TrafficController);
//# sourceMappingURL=traffic.controller.js.map