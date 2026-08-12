import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoadSegment, RoadClass } from './traffic/entities/road-segment.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const segmentRepo = app.get<Repository<RoadSegment>>(getRepositoryToken(RoadSegment));

  console.log('Seeding database with Lagos road segments...');

  // Realistic coordinates for Lagos
  const segments = [
    {
      name: 'Third Mainland Bridge',
      lanes: 4,
      speed_limit: 80,
      road_class: RoadClass.HIGHWAY,
      geometry: {
        type: 'LineString',
        coordinates: [
          [3.3958, 6.4698],
          [3.3980, 6.4850],
          [3.4020, 6.5100],
          [3.4005, 6.5400]
        ]
      }
    },
    {
      name: 'Eko Bridge',
      lanes: 3,
      speed_limit: 80,
      road_class: RoadClass.HIGHWAY,
      geometry: {
        type: 'LineString',
        coordinates: [
          [3.3850, 6.4650],
          [3.3800, 6.4750],
          [3.3750, 6.4850]
        ]
      }
    },
    {
      name: 'Carter Bridge',
      lanes: 2,
      speed_limit: 60,
      road_class: RoadClass.ARTERIAL,
      geometry: {
        type: 'LineString',
        coordinates: [
          [3.3880, 6.4660],
          [3.3840, 6.4710],
          [3.3820, 6.4760]
        ]
      }
    },
    {
      name: 'Ikorodu Road',
      lanes: 3,
      speed_limit: 80,
      road_class: RoadClass.HIGHWAY,
      geometry: {
        type: 'LineString',
        coordinates: [
          [3.3650, 6.5250],
          [3.3670, 6.5500],
          [3.3700, 6.5800],
          [3.3720, 6.6000]
        ]
      }
    },
    {
      name: 'Lekki-Epe Expressway',
      lanes: 3,
      speed_limit: 80,
      road_class: RoadClass.HIGHWAY,
      geometry: {
        type: 'LineString',
        coordinates: [
          [3.4350, 6.4350],
          [3.4600, 6.4400],
          [3.5000, 6.4500],
          [3.5500, 6.4600]
        ]
      }
    }
  ];

  for (const seg of segments) {
    const existing = await segmentRepo.findOne({ where: { name: seg.name } });
    if (!existing) {
      const entity = segmentRepo.create(seg as any);
      await segmentRepo.save(entity);
      console.log(`Inserted segment: ${seg.name}`);
    } else {
      console.log(`Segment already exists: ${seg.name}`);
    }
  }

  console.log('Seeding complete.');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
