import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoadSegment } from './traffic/entities/road-segment.entity';
import { TrafficReading } from './traffic/entities/traffic-reading.entity';
import { WeatherSnapshot } from './traffic/entities/weather-snapshot.entity';
import { EventFlag } from './traffic/entities/event-flag.entity';
import { Prediction } from './traffic/entities/prediction.entity';
import { UserReport } from './traffic/entities/user-report.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'trafficwise',
      entities: [
        RoadSegment,
        TrafficReading,
        WeatherSnapshot,
        EventFlag,
        Prediction,
        UserReport,
      ],
      synchronize: true, // Auto-create tables for now; we'll add migrations later
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
