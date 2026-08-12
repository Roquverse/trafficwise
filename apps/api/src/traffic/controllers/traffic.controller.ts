import { Controller, Get, Param, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TrafficService } from '../services/traffic.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/entities/user.entity';

@Controller('api')
export class TrafficController {
  constructor(private readonly trafficService: TrafficService) {}

  @Get('segments')
  async getSegments() {
    return this.trafficService.getSegmentsWithCongestion();
  }

  @Get('segments/:id')
  async getSegmentDetails(@Param('id') id: string) {
    return this.trafficService.getSegmentDetails(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reports')
  async reportIncident(@Request() req, @Body() body) {
    return this.trafficService.reportIncident(req.user.userId, body.segmentId, body.reportType);
  }

  // Ops only endpoint
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OPS)
  @Get('system/health')
  async getSystemHealth() {
    return this.trafficService.getSystemHealth();
  }
}
