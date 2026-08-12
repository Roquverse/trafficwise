import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficService } from './services/traffic.service';
import { TrafficController } from './controllers/traffic.controller';
import { RoadSegment } from './entities/road-segment.entity';
import { TrafficReading } from './entities/traffic-reading.entity';
import { WeatherSnapshot } from './entities/weather-snapshot.entity';
import { EventFlag } from './entities/event-flag.entity';
import { Prediction } from './entities/prediction.entity';
import { UserReport } from './entities/user-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoadSegment,
      TrafficReading,
      WeatherSnapshot,
      EventFlag,
      Prediction,
      UserReport,
    ]),
  ],
  providers: [TrafficService],
  controllers: [TrafficController],
  exports: [TrafficService],
})
export class TrafficModule {}
