"use client";

import { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/mapbox';
import type { LineLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Search, AlertTriangle, LayoutDashboard, BarChart3, Users, Settings, 
  HelpCircle, LogOut, X, Layers, Crosshair, Plus, Minus, Bell, User,
  TrendingDown, TrendingUp, ArrowRight, ArrowUpRight, BellRing
} from 'lucide-react';
import { io } from 'socket.io-client';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYm9ndXMtdG9rZW4iLCJhIjoiYm9ndXN0b2tlbiJ9.bogus-token'; // Fallback token
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function OpsMap() {
  const [viewState, setViewState] = useState({
    longitude: -74.006, // Defaulting to NY/I-95 area for mockup aesthetic
    latitude: 40.7128,
    zoom: 12,
    pitch: 0,
  });

  const [segments, setSegments] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(true);

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

  // Mock data for the map visual
  const displayGeojson = segments.length > 0 ? geojson : {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { congestion: 'High', id: '1', name: 'I-95 Northbound' },
        geometry: { type: 'LineString', coordinates: [[-74.01, 40.71], [-74.01, 40.73]] }
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
    <div className="flex flex-col h-screen bg-[#111111] text-slate-200 font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-[#0a0a0a] flex items-center justify-between px-6 z-20 shrink-0">
        <div className="text-2xl font-bold text-amber-500 tracking-tight">TrafficWise</div>
        
        <div className="flex items-center space-x-6">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-slate-800/50 text-slate-300 rounded-full py-1.5 pl-4 pr-10 outline-none border border-slate-700/50 focus:border-slate-500 transition-colors text-sm w-64"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          </div>
          <div className="relative cursor-pointer hover:text-white transition-colors">
            <Bell size={20} className="text-slate-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0a]"></span>
          </div>
          <div className="cursor-pointer">
            <User size={22} className="text-slate-400 hover:text-white transition-colors" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#141414] border-r border-slate-800 flex flex-col justify-between z-20 shrink-0">
          <div>
            {/* User Profile Header */}
            <div className="p-6 pb-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3">
                  <User size={20} className="text-teal-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 leading-tight">Ops Console</h2>
                  <p className="text-xs text-slate-400">Network Intelligence</p>
                </div>
              </div>
              
              <button className="w-full bg-amber-400 hover:bg-amber-500 text-[#141414] font-bold py-2.5 rounded-lg flex items-center justify-center text-sm transition-colors mb-6 shadow-lg shadow-amber-500/10">
                <BellRing size={16} className="mr-2" />
                Report Incident
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 px-3">
              <a href="#" className="flex items-center px-3 py-2.5 bg-amber-500/10 text-amber-500 rounded-lg font-medium text-sm border-l-2 border-amber-500 transition-colors">
                <LayoutDashboard size={18} className="mr-3" />
                Dashboard
              </a>
              <a href="#" className="flex items-center justify-between px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                <div className="flex items-center">
                  <AlertTriangle size={18} className="mr-3" />
                  Traffic Alerts
                </div>
                <span className="bg-slate-700/50 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
              </a>
              <a href="#" className="flex items-center px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                <BarChart3 size={18} className="mr-3" />
                Analytics
              </a>
              <a href="#" className="flex items-center px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                <Users size={18} className="mr-3" />
                User Management
              </a>
              <a href="#" className="flex items-center px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors">
                <Settings size={18} className="mr-3" />
                Settings
              </a>
            </nav>
          </div>

          <div className="p-4 space-y-1 mb-2">
            <a href="#" className="flex items-center px-3 py-2 text-slate-400 hover:text-slate-200 rounded-lg font-medium text-sm transition-colors">
              <HelpCircle size={18} className="mr-3" />
              Support
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-slate-400 hover:text-slate-200 rounded-lg font-medium text-sm transition-colors">
              <LogOut size={18} className="mr-3" />
              Logout
            </a>
          </div>
        </aside>

        {/* Main Map Area */}
        <main className="flex-1 relative bg-[#1a1a1a]">
          
          {/* Top Floating Alert */}
          {showAlert && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#8B0000] border border-red-700 text-white rounded-lg shadow-2xl py-3 px-4 w-[450px]">
              <AlertTriangle size={20} className="mr-3 shrink-0" />
              <div className="flex-1 text-sm font-medium pr-4">
                Incident Detected: Multi-vehicle collision on I-95 N.
              </div>
              <div className="flex items-center border-l border-red-800/50 pl-3">
                <button className="text-xs font-bold mr-3 hover:text-red-200 uppercase tracking-wider">
                  View
                </button>
                <button onClick={() => setShowAlert(false)} className="text-red-300 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Mapbox Instance */}
          <div className="absolute inset-0 z-10">
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

          {/* Map Controls */}
          <div className="absolute bottom-6 right-[350px] flex flex-col space-y-2 z-30">
            <div className="bg-[#141414]/90 backdrop-blur border border-slate-800 rounded-full shadow-lg flex flex-col overflow-hidden">
              <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800">
                <Layers size={18} />
              </button>
              <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Crosshair size={18} />
              </button>
            </div>
            <div className="bg-[#141414]/90 backdrop-blur border border-slate-800 rounded-full shadow-lg flex flex-col overflow-hidden mt-4">
              <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800">
                <Plus size={18} />
              </button>
              <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Minus size={18} />
              </button>
            </div>
          </div>

          {/* Right Monitored Segments Panel */}
          <div className="absolute top-6 right-6 w-[320px] bg-[#1a1a1a]/95 backdrop-blur-md border border-slate-800 rounded-2xl z-30 shadow-2xl flex flex-col max-h-[calc(100vh-100px)]">
            <div className="p-4 border-b border-slate-800/50">
              <div className="w-8 h-1 bg-slate-700 rounded-full mx-auto mb-4"></div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-slate-100">Monitored Segments</h3>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Real-time severity ranking</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="11" y2="14"></line><line x1="21" y1="18" x2="15" y2="18"></line></svg>
              </div>
            </div>

            <div className="overflow-y-auto p-3 space-y-2">
              {/* Item 1 */}
              <div className="bg-[#111111] p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex justify-between items-center group cursor-pointer">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">I-95 Northbound</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Sector 7G • 2.4mi</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full flex items-center text-xs font-bold">
                  12<span className="text-[10px] font-medium ml-0.5">mph</span>
                  <TrendingDown size={12} className="ml-1.5" />
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-[#111111] p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex justify-between items-center group cursor-pointer">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Route 66 East</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Downtown Loop • 1.1mi</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full flex items-center text-xs font-bold">
                  28<span className="text-[10px] font-medium ml-0.5">mph</span>
                  <ArrowRight size={12} className="ml-1.5" />
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-[#111111] p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex justify-between items-center group cursor-pointer">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Pacific Coast Hwy</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Bay Area • 5.0mi</p>
                </div>
                <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full flex items-center text-xs font-bold">
                  55<span className="text-[10px] font-medium ml-0.5">mph</span>
                  <TrendingUp size={12} className="ml-1.5" />
                </div>
              </div>

              {/* Item 4 */}
              <div className="bg-[#111111] p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex justify-between items-center group cursor-pointer">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Main St Bridge</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">River District • 0.8mi</p>
                </div>
                <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full flex items-center text-xs font-bold">
                  45<span className="text-[10px] font-medium ml-0.5">mph</span>
                  <ArrowUpRight size={12} className="ml-1.5" />
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
