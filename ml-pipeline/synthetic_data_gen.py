import os
import random
import uuid
import math
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values

# Database connection
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "trafficwise")

# Simulation parameters
DAYS_TO_GENERATE = 30
INTERVAL_MINUTES = 15

# Lagos-style peak hours (e.g., 6AM-9AM, 4PM-8PM)
def get_time_of_day_factor(dt):
    hour = dt.hour
    if 6 <= hour <= 9:
        return 1.8 + random.uniform(-0.2, 0.4) # Morning peak
    elif 16 <= hour <= 20:
        return 1.9 + random.uniform(-0.2, 0.5) # Evening peak
    elif 1 <= hour <= 4:
        return 0.3 + random.uniform(0, 0.1) # Night off-peak
    else:
        return 1.0 + random.uniform(-0.1, 0.2) # Normal

def generate_traffic_data(conn):
    cur = conn.cursor()
    
    # 1. Setup TimescaleDB and PostGIS extensions if not exist
    cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    cur.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")
    conn.commit()

    # Create tables if they don't exist (assuming TypeORM might not have run)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS road_segment (
        id UUID PRIMARY KEY,
        name VARCHAR,
        geometry geometry(LineString, 4326),
        lanes INT,
        speed_limit INT,
        road_class VARCHAR
    );
    """)
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS traffic_reading (
        id UUID,
        segment_id UUID REFERENCES road_segment(id),
        timestamp TIMESTAMPTZ,
        avg_speed FLOAT,
        vehicle_count INT,
        occupancy FLOAT,
        source_type VARCHAR,
        PRIMARY KEY (id, timestamp)
    );
    """)
    
    # Convert to hypertable if not already
    cur.execute("""
    SELECT create_hypertable('traffic_reading', 'timestamp', if_not_exists => TRUE);
    """)
    conn.commit()

    # 2. Seed Road Segments (Mocking a few major Lagos routes)
    segments = [
        (str(uuid.uuid4()), "Third Mainland Bridge", "SRID=4326;LINESTRING(3.4 6.5, 3.45 6.45)", 4, 80, "Highway"),
        (str(uuid.uuid4()), "Ikorodu Road", "SRID=4326;LINESTRING(3.36 6.52, 3.36 6.6)", 3, 60, "Arterial"),
        (str(uuid.uuid4()), "Lekki-Epe Expressway", "SRID=4326;LINESTRING(3.45 6.43, 3.55 6.45)", 3, 80, "Highway")
    ]
    
    cur.execute("DELETE FROM traffic_reading;")
    cur.execute("DELETE FROM road_segment;")
    
    execute_values(cur, """
        INSERT INTO road_segment (id, name, geometry, lanes, speed_limit, road_class)
        VALUES %s
    """, segments)
    
    # 3. Generate Time-Series Data
    print(f"Generating {DAYS_TO_GENERATE} days of synthetic traffic data...")
    now = datetime.utcnow()
    start_time = now - timedelta(days=DAYS_TO_GENERATE)
    
    current_time = start_time
    readings = []
    
    while current_time <= now:
        tod_factor = get_time_of_day_factor(current_time)
        
        # Add a random incident spike chance (5%)
        incident_factor = 2.5 if random.random() < 0.05 else 1.0
        
        for seg in segments:
            seg_id, seg_name, _, lanes, speed_limit, _ = seg
            
            # Base capacity per lane per hour approx 1800-2000
            max_capacity_15min = (1900 * lanes) / 4 
            
            # Simulate arrival rate (queueing theory basics)
            base_arrival = max_capacity_15min * 0.4
            actual_arrival = base_arrival * tod_factor
            
            # Incorporate incidents (bottlenecks)
            service_rate = max_capacity_15min / incident_factor
            
            rho = actual_arrival / service_rate  # Arrival to service ratio
            
            # LWR macroscopic flow approximations
            # k (density) increases as flow approaches capacity
            k_jam = 150 * lanes # veh/km
            
            if rho >= 1.0: # Congestion / Queueing
                avg_speed = speed_limit * random.uniform(0.1, 0.3)
                occupancy = random.uniform(0.7, 0.95)
                vehicle_count = int(service_rate) # Bottleneck limits throughput
            else: # Free flow or stable flow
                avg_speed = speed_limit * (1 - (rho * 0.5))
                occupancy = rho * 0.5
                vehicle_count = int(actual_arrival)
            
            # Add noise
            avg_speed = max(5.0, min(float(speed_limit), avg_speed + random.uniform(-5, 5)))
            occupancy = max(0.01, min(1.0, occupancy + random.uniform(-0.05, 0.05)))
            vehicle_count = max(0, vehicle_count + int(random.uniform(-10, 10)))
            
            readings.append((
                str(uuid.uuid4()),
                seg_id,
                current_time,
                avg_speed,
                vehicle_count,
                occupancy,
                'Synthetic'
            ))
            
        current_time += timedelta(minutes=INTERVAL_MINUTES)
        
        # Batch insert every 10000 records to save memory
        if len(readings) >= 10000:
            execute_values(cur, """
                INSERT INTO traffic_reading (id, segment_id, timestamp, avg_speed, vehicle_count, occupancy, source_type)
                VALUES %s
            """, readings)
            readings = []
            
    if readings:
        execute_values(cur, """
            INSERT INTO traffic_reading (id, segment_id, timestamp, avg_speed, vehicle_count, occupancy, source_type)
            VALUES %s
        """, readings)

    conn.commit()
    cur.close()
    print("Data generation complete.")

if __name__ == "__main__":
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        generate_traffic_data(conn)
        conn.close()
    except Exception as e:
        print(f"Error connecting to database: {e}")
