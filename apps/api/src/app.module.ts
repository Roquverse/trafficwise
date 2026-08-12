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
import { User } from './auth/entities/user.entity';

import { AuthModule } from './auth/auth.module';
import { TrafficModule } from './traffic/traffic.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10),
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
        User,
      ],
      synchronize: true, // Auto-create tables for now; we'll add migrations later
    }),
    AuthModule,
    TrafficModule,
    StreamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
