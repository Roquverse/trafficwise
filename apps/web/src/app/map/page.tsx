"use client";

import { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import type { LineLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Navigation, AlertTriangle, Menu } from 'lucide-react';
import { io } from 'socket.io-client';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYm9ndXMtdG9rZW4iLCJhIjoiYm9ndXN0b2tlbiJ9.bogus-token'; // Fallback token
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function LiveMap() {
  const [viewState, setViewState] = useState({
    longitude: 3.4064,
    latitude: 6.4541, // Lagos coordinates
    zoom: 12,
    pitch: 45,
  });

  const [segments, setSegments] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch initial segments
    fetch(`${API_URL}/api/segments`)
      .then(res => res.json())
      .then(data => {
        setSegments(data);
      })
      .catch(err => console.error("Failed to fetch segments", err));

    // 2. Connect to WebSocket for live updates
    const socket = io(`${API_URL}/traffic-stream`);
    
    socket.on('connect', () => {
      // Subscribe to all segments for now (or a specific bounding box)
      socket.emit('subscribe', { segmentIds: segments.map((s: any) => s.id) });
    });

    socket.on('congestion_update', (update) => {
      setSegments(prev => prev.map(seg => 
        seg.id === update.segmentId 
          ? { ...seg, current_congestion: update.newCongestionLevel, confidence: update.confidence }
          : seg
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Convert to GeoJSON for Mapbox
  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: segments.map(seg => ({
      type: 'Feature',
      properties: { congestion: seg.current_congestion, id: seg.id, name: seg.name },
      geometry: seg.geometry // Assuming the backend returns standard GeoJSON geometry
    }))
  }), [segments]);

  // Fallback mock data if API fails to load
  const displayGeojson = segments.length > 0 ? geojson : {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { congestion: 'High', id: '1' },
        geometry: { type: 'LineString', coordinates: [[3.36, 6.52], [3.36, 6.6]] }
      },
      {
        type: 'Feature',
        properties: { congestion: 'Medium', id: '2' },
        geometry: { type: 'LineString', coordinates: [[3.4, 6.5], [3.45, 6.45]] }
      }
    ]
  };

  const lineLayer: LineLayer = {
    id: 'road-segments',
    type: 'line',
    source: 'segments',
    paint: {
      'line-width': 6,
      'line-color': [
        'match',
        ['get', 'congestion'],
        'Low', '#0d9488',    // teal-600
        'Medium', '#f59e0b', // amber-500
        'High', '#ea580c',   // orange-600
        '#64748b'            // default
      ],
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 flex flex-col">
      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-full px-4 py-2 flex items-center shadow-lg border border-slate-700/50 pointer-events-auto">
          <Menu className="text-slate-300 mr-3" size={20} />
          <h1 className="text-primary font-bold tracking-tight">TrafficWise</h1>
        </div>
        
        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-700/50 pointer-events-auto text-red-400">
          <AlertTriangle size={20} />
        </div>
      </header>

      {/* Mapbox */}
      <div className="flex-1 w-full h-full">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || MAPBOX_TOKEN}
        >
          <Source id="segments" type="geojson" data={displayGeojson as any}>
            <Layer {...lineLayer} />
          </Source>
        </Map>
      </div>

      {/* Bottom Sheet UI */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-10">
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6"></div>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Where to?" 
            className="w-full bg-slate-800 text-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none border border-slate-700 focus:border-primary transition-colors placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-2">Saved Routes</h3>
          
          <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between border border-slate-700/50 active:bg-slate-800 transition-colors">
            <div className="flex items-center">
              <div className="bg-slate-700 p-2 rounded-xl mr-4">
                <Navigation size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Work to Home</h4>
                <p className="text-sm text-slate-400">Via 3rd Mainland Bridge</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-100">45 min</div>
              <div className="text-xs text-orange-500 font-semibold bg-orange-500/10 px-2 py-1 rounded-md inline-block mt-1">High Congestion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
