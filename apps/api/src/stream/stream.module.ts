import { Module } from '@nestjs/common';
import { TrafficGateway } from './traffic.gateway';
import { TrafficModule } from '../traffic/traffic.module';

@Module({
  imports: [TrafficModule],
  providers: [TrafficGateway],
})
export class StreamModule {}
