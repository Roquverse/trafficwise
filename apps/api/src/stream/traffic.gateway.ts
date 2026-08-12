import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrafficService } from '../traffic/services/traffic.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/traffic-stream',
})
export class TrafficGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly trafficService: TrafficService) {}

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { segmentIds?: string[], bbox?: any },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.segmentIds) {
      data.segmentIds.forEach(id => {
        client.join(`segment_${id}`);
      });
      return { status: 'Subscribed to segments', segmentIds: data.segmentIds };
    }
    return { status: 'Invalid subscription request' };
  }

  // This method would be called by a cron job or event listener when new ML predictions arrive
  broadcastCongestionUpdate(segmentId: string, newCongestionLevel: string, confidence: number) {
    this.server.to(`segment_${segmentId}`).emit('congestion_update', {
      segmentId,
      newCongestionLevel,
      confidence,
      timestamp: new Date().toISOString()
    });
  }

  // Example alert for threshold crossing
  broadcastAlert(userId: string, message: string) {
    // In a real app, users would join a room with their user ID
    this.server.to(`user_${userId}`).emit('alert', {
      message,
      timestamp: new Date().toISOString()
    });
  }
}
