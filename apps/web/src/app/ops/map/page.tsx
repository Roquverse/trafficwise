"use client";

import { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import type { LineLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYm9ndXMtdG9rZW4iLCJhIjoiYm9ndXN0b2tlbiJ9.bogus-token'; // Fallback token
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function OpsMap() {
  const [viewState, setViewState] = useState({
    longitude: 3.4064,
    latitude: 6.4541,
    zoom: 12,
    pitch: 0,
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

  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: segments.map(seg => ({
      type: 'Feature',
      properties: { congestion: seg.current_congestion, id: seg.id, name: seg.name },
      geometry: seg.geometry
    }))
  }), [segments]);

  const displayGeojson = segments.length > 0 ? geojson : {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { congestion: 'High', id: '1', name: 'Third Mainland Bridge' },
        geometry: { type: 'LineString', coordinates: [[3.36, 6.52], [3.36, 6.6]] }
      },
      {
        type: 'Feature',
        properties: { congestion: 'Medium', id: '2', name: 'Ikorodu Road' },
        geometry: { type: 'LineString', coordinates: [[3.4, 6.5], [3.45, 6.45]] }
      },
      {
        type: 'Feature',
        properties: { congestion: 'Low', id: '3', name: 'Lekki-Epe Exp' },
        geometry: { type: 'LineString', coordinates: [[3.45, 6.43], [3.55, 6.45]] }
      }
    ]
  };

  const lineLayer: LineLayer = {
    id: 'road-segments',
    type: 'line',
    source: 'segments',
    paint: {
      'line-width': 4,
      'line-color': [
        'match',
        ['get', 'congestion'],
        'Low', '#0d9488',    
        'Medium', '#f59e0b', 
        'High', '#ea580c',   
        '#64748b'            
      ],
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-900">
      
      {/* List Panel (Left) */}
      <div className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10 shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Segment Analysis</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search segments..." 
              className="w-full bg-slate-950 text-slate-200 rounded-lg py-2 pl-10 pr-4 outline-none border border-slate-800 focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayGeojson.features.map(f => (
            <div key={f.properties.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-200 group-hover:text-primary transition-colors">{f.properties.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  f.properties.congestion === 'High' ? 'bg-orange-500/10 text-orange-500' :
                  f.properties.congestion === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-teal-500/10 text-teal-500'
                }`}>
                  {f.properties.congestion}
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500 space-x-4">
                <span className="flex items-center"><TrendingUp size={14} className="mr-1" /> Conf: 89%</span>
                <span className="flex items-center"><Clock size={14} className="mr-1" /> +15m Forecast</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area (Right) */}
      <div className="flex-1 relative">
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
        
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-xl">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-teal-600 mr-2"></div><span className="text-slate-300">Free Flow</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div><span className="text-slate-300">Moderate</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-600 mr-2"></div><span className="text-slate-300">Heavy Queue</span></div>
          </div>
        </div>
      </div>

    </div>
  );
}
