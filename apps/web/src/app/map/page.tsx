"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { LineLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Search, Menu, User, Navigation, AlertTriangle, 
  Coffee, Fuel, Briefcase, Home, ShieldAlert, 
  Crosshair, Navigation2, Zap, MoreVertical, X, MapPin, 
  ArrowLeft, ArrowDownUp, Circle, Newspaper, Settings, LogOut
} from 'lucide-react';
import { io } from 'socket.io-client';

const FALLBACK_MAPBOX_TOKEN = 'pk.eyJ1IjoiYm9ndXMtdG9rZW4iLCJhIjoiYm9ndXN0b2tlbiJ9.bogus-token'; 
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function CommuterMap() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || FALLBACK_MAPBOX_TOKEN;
  
  const [viewState, setViewState] = useState({
    longitude: 3.4064,
    latitude: 6.4541, // Default Lagos
    zoom: 13,
    pitch: 45,
    bearing: -17.6,
  });

  const [segments, setSegments] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    import('../actions/auth').then(m => m.getUserSession().then(setUserProfile));
  }, []);

  // Routing Mode states
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [activeInput, setActiveInput] = useState<'from'|'to'|null>(null);

  const [startQuery, setStartQuery] = useState('Your Location');
  const [startLocation, setStartLocation] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: number} | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetch(`${API_URL}/api/segments`)
      .then(res => res.json())
      .then(data => setSegments(data))
      .catch(err => console.error("Failed to fetch segments", err));

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
    return () => { socket.disconnect(); };
  }, []);

  // Fetch dynamic AI alerts whenever destination changes
  useEffect(() => {
    let url = `${API_URL}/api/alerts`;
    if (selectedDestination) {
      url += `?dest=${encodeURIComponent(selectedDestination.text)}`;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => setActiveAlerts(Array.isArray(data) ? data : (data ? [data] : [])))
      .catch(err => console.error("Failed to fetch alerts", err));
  }, [selectedDestination]);

  const fetchDirections = async (start: any, dest: any) => {
    const startLng = start ? start.center[0] : 3.4064;
    const startLat = start ? start.center[1] : 6.4541;
    const destLng = dest.center[0];
    const destLat = dest.center[1];

    try {
      const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startLng},${startLat};${destLng},${destLat}?geometries=geojson&annotations=congestion&overview=full&access_token=${mapboxToken}`);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates;
        const congestions = route.legs[0]?.annotation?.congestion || [];
        
        const features = [];
        if (congestions.length > 0) {
          // Break the route down into individual segments to colorize them based on live traffic
          for (let i = 0; i < coords.length - 1; i++) {
            features.push({
              type: 'Feature',
              properties: { congestion: congestions[i] || 'unknown' },
              geometry: {
                type: 'LineString',
                coordinates: [coords[i], coords[i + 1]]
              }
            });
          }
        } else {
          // Fallback if no traffic data is available for this route
          features.push({
            type: 'Feature',
            properties: { congestion: 'unknown' },
            geometry: route.geometry
          });
        }

        setRouteData({
          type: 'FeatureCollection',
          features: features
        });
        
        // Convert distance to km and duration to minutes
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1) + ' km',
          duration: Math.round(route.duration / 60)
        });
        
        // Pan to midpoint
        setViewState(prev => ({
          ...prev,
          longitude: (startLng + destLng) / 2,
          latitude: (startLat + destLat) / 2,
          zoom: 12
        }));
      }
    } catch (err) {
      console.error("Directions error:", err);
    }
  };

  const onSearchInput = (query: string, inputType: 'from' | 'to') => {
    setActiveInput(inputType);
    if (inputType === 'from') {
      setStartQuery(query);
      if (query === '') setStartLocation(null);
    } else {
      setSearchQuery(query);
      if (query === '') {
        setSelectedDestination(null);
        setRouteData(null);
        setRouteInfo(null);
      }
    }
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!query.trim() || query === 'Your Location') {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&proximity=3.4064,6.4541&country=ng&types=place,poi,address&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data.features) setSearchResults(data.features);
        })
        .catch(err => console.error("Geocoding error:", err));
    }, 400);
  };

  const onSelectLocation = async (feature: any) => {
    setSearchResults([]);
    
    let currentStart = startLocation;
    let currentDest = selectedDestination;

    if (activeInput === 'from') {
      setStartQuery(feature.text);
      setStartLocation(feature);
      currentStart = feature;
    } else {
      setSearchQuery(feature.text);
      setSelectedDestination(feature);
      currentDest = feature;
      setIsRoutingMode(true);
    }
    
    setActiveInput(null);

    if (currentDest) {
      await fetchDirections(currentStart, currentDest);
    } else if (feature) {
      setViewState(prev => ({
        ...prev,
        longitude: feature.center[0],
        latitude: feature.center[1],
        zoom: 14
      }));
    }
  };

  const swapLocations = () => {
    const tempQuery = startQuery;
    const tempLoc = startLocation;
    
    setStartQuery(searchQuery || 'Your Location');
    setStartLocation(selectedDestination);
    
    setSearchQuery(tempQuery === 'Your Location' ? '' : tempQuery);
    setSelectedDestination(tempLoc);

    if (tempLoc || selectedDestination) {
      fetchDirections(selectedDestination, tempLoc);
    }
  };

  const exitRoutingMode = () => {
    setIsRoutingMode(false);
    setSearchQuery('');
    setSelectedDestination(null);
    setRouteData(null);
    setRouteInfo(null);
    setSearchResults([]);
  };

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
        properties: { congestion: 'High', id: '1' },
        geometry: { type: 'LineString', coordinates: [[3.36, 6.52], [3.38, 6.55], [3.40, 6.50]] }
      }
    ]
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] font-sans overflow-hidden">
      
      {/* Mapbox */}
      <div className="absolute inset-0 z-0">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={mapboxToken}
        >
          {!isRoutingMode && (
            <Source id="segments" type="geojson" data={displayGeojson as any}>
              <Layer 
                id="road-segments"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{
                  'line-width': 8,
                  'line-color': [
                    'match', ['get', 'congestion'],
                    'Low', '#0d9488',
                    'Medium', '#f59e0b',
                    'High', '#ea580c',
                    '#64748b'
                  ],
                  'line-opacity': 0.8
                }} 
              />
            </Source>
          )}

          {routeData && (
            <Source id="route" type="geojson" data={routeData}>
              <Layer 
                id="active-route"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{
                  'line-width': 6,
                  'line-color': [
                    'match', ['get', 'congestion'],
                    'low', '#10b981',      // emerald-500
                    'moderate', '#f59e0b', // amber-500
                    'heavy', '#ef4444',    // red-500
                    'severe', '#991b1b',   // red-800
                    '#0ea5e9'              // sky-500 (unknown/default)
                  ],
                  'line-opacity': 1
                }}
              />
            </Source>
          )}
        </Map>
      </div>

      {/* Top Overlay UI */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none p-4 md:p-6 flex flex-col items-center">
        <div className="relative w-full max-w-2xl">
          
          {isRoutingMode ? (
            /* Dual Input Routing Panel */
            <div className="bg-[#111111]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-4 pointer-events-auto flex items-start gap-4">
              <button onClick={exitRoutingMode} className="p-2 text-slate-400 hover:text-white mt-1 transition-colors">
                <ArrowLeft size={24} />
              </button>
              
              <div className="flex-1 flex flex-col gap-3 relative">
                {/* Timeline visual connector */}
                <div className="absolute left-2.5 top-5 bottom-5 w-0.5 bg-slate-700 flex flex-col items-center justify-between">
                  <Circle size={10} className="text-slate-400 bg-[#111111] fill-current mt-[-5px]" />
                  <MapPin size={12} className="text-amber-500 bg-[#111111] fill-current mb-[-5px]" />
                </div>

                <div className="bg-slate-800/50 rounded-xl px-4 py-2.5 flex items-center pl-10 border border-slate-700/50 focus-within:border-slate-500 transition-colors">
                  <input 
                    type="text" 
                    value={startQuery}
                    onChange={(e) => onSearchInput(e.target.value, 'from')}
                    placeholder="Choose starting point" 
                    className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 outline-none font-medium text-base"
                  />
                </div>
                <div className="bg-slate-800/50 rounded-xl px-4 py-2.5 flex items-center pl-10 border border-slate-700/50 focus-within:border-teal-500 transition-colors">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => onSearchInput(e.target.value, 'to')}
                    placeholder="Choose destination" 
                    className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 outline-none font-medium text-base"
                  />
                </div>
              </div>

              <button onClick={swapLocations} className="p-2 text-slate-400 hover:text-white mt-8 bg-slate-800/50 rounded-full transition-colors border border-slate-700 hover:border-slate-500">
                <ArrowDownUp size={18} />
              </button>
            </div>
          ) : (
            /* Single Search Bar */
            <div className="bg-[#111111]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center p-2 pointer-events-auto transition-transform hover:scale-[1.01]">
              <button onClick={() => setIsMenuOpen(true)} className="p-3 text-slate-400 hover:text-white transition-colors">
                <Menu size={24} />
              </button>
              <div className="h-8 w-px bg-slate-700 mx-2"></div>
              <div className="flex-1 flex items-center px-2">
                <Search className="text-slate-500 mr-3" size={20} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => onSearchInput(e.target.value, 'to')}
                  placeholder="Where to?" 
                  className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 outline-none text-lg font-medium"
                />
              </div>
              <div className="relative pointer-events-auto">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-1 mx-2 bg-slate-800 rounded-full border border-slate-600 hover:border-primary transition-colors overflow-hidden"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-amber-500 flex items-center justify-center">
                    <User size={18} className="text-[#111111]" />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute top-full right-2 mt-3 w-56 bg-[#111111]/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-800/80">
                      <p className="text-sm font-semibold text-white">{userProfile?.name || 'Commuter'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{userProfile?.email || 'Guest'}</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center">
                        <Settings size={16} className="mr-3 text-slate-400" />
                        Settings
                      </button>
                      <button 
                        onClick={() => {
                          window.location.href = '/login';
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-slate-800/50 transition-colors flex items-center"
                      >
                        <LogOut size={16} className="mr-3" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Predictive Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111]/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
              {searchResults.map((result) => (
                <button 
                  key={result.id}
                  onClick={() => onSelectLocation(result)}
                  className="w-full flex items-center px-6 py-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <MapPin className="text-slate-400 mr-4 shrink-0" size={20} />
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-semibold">{result.text}</span>
                    {result.place_name && (
                      <span className="text-slate-500 text-xs truncate max-w-sm">{result.place_name}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Pills */}
        {!isRoutingMode && (
          <div className="w-full max-w-2xl mt-4 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto px-2">
            <button className="flex items-center whitespace-nowrap bg-[#111111]/80 backdrop-blur-md border border-slate-700 hover:border-teal-500/50 text-slate-200 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-teal-900/20 shadow-lg">
              <Briefcase size={16} className="text-teal-400 mr-2" /> Work <span className="text-teal-400 ml-2">24 min</span>
            </button>
            <button className="flex items-center whitespace-nowrap bg-[#111111]/80 backdrop-blur-md border border-slate-700 hover:border-amber-500/50 text-slate-200 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-amber-900/20 shadow-lg">
              <Home size={16} className="text-amber-400 mr-2" /> Home <span className="text-slate-400 ml-2">45 min</span>
            </button>
            <button className="flex items-center whitespace-nowrap bg-[#111111]/80 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-slate-800 shadow-lg">
              <Coffee size={16} className="text-slate-400 mr-2" /> Coffee
            </button>
          </div>
        )}
      </div>

      {/* Map Legend */}
      {isRoutingMode && (
        <div className="absolute bottom-[340px] left-4 md:left-8 z-20 pointer-events-auto flex flex-col gap-2">
          <div className="bg-[#111111]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Traffic Legend</h4>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs text-slate-300 font-semibold">Fast</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <span className="text-xs text-slate-300 font-semibold">Moderate</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <span className="text-xs text-slate-300 font-semibold">Heavy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#991b1b] shadow-[0_0_8px_rgba(153,27,27,0.5)]"></div>
                <span className="text-xs text-slate-300 font-semibold">Severe</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-[340px] right-4 md:right-8 flex flex-col gap-4 z-20 pointer-events-auto">
        <button 
          onClick={() => setViewState(prev => ({ ...prev, longitude: 3.4064, latitude: 6.4541, zoom: 14 }))}
          className="w-14 h-14 bg-[#111111]/90 backdrop-blur-md border border-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-xl"
        >
          <Crosshair size={24} />
        </button>
        <button className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-[#111111] hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-110">
          <ShieldAlert size={26} />
        </button>
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center pb-4 px-4">
        <div className="w-full max-w-2xl bg-[#111111]/95 backdrop-blur-2xl border border-slate-800 rounded-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] pointer-events-auto overflow-hidden transition-all duration-300">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-4 mb-2"></div>
          
          <div className="p-6 pt-2">
            {activeAlerts.map((alert, idx) => (
              <div key={idx} className={`border rounded-xl p-4 flex items-start gap-4 mb-3 ${
                alert.source === 'news' 
                  ? 'bg-gradient-to-r from-blue-900/40 to-[#111111] border-blue-500/20' 
                  : 'bg-gradient-to-r from-orange-900/40 to-[#111111] border-orange-500/20'
              }`}>
                <div className={`p-2 rounded-lg shrink-0 ${
                  alert.source === 'news'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {alert.source === 'news' ? <Newspaper size={20} /> : <Zap size={20} />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm mb-1 uppercase tracking-wider ${
                    alert.source === 'news' ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                    {alert.source === 'news' ? 'AI News Report' : 'AI Predictive Alert'}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {alert.source === 'news' ? (
                      <>{alert.prediction}</>
                    ) : (
                      <>Avoid <span className="font-semibold text-white">{alert.segmentName}</span>. {alert.prediction}</>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {isRoutingMode && selectedDestination ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Smart Routes to {selectedDestination.text}</h2>
                  <div className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-semibold border border-slate-700">
                    {routeInfo?.distance}
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-slate-800/40 border border-teal-500/30 hover:border-teal-500 hover:bg-slate-800/60 transition-all rounded-2xl p-4 flex items-center group text-left relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500"></div>
                    <div className="bg-teal-500/20 text-teal-400 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform">
                      <Navigation2 size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-100 text-lg">Fastest Route</h4>
                        <span className="text-2xl font-bold text-teal-400">{routeInfo?.duration || 18}<span className="text-sm text-teal-500 ml-1">min</span></span>
                      </div>
                      <p className="text-slate-400 text-sm flex items-center">
                        <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> Recommended AI Route
                      </p>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-300">Recent Searches</h2>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="flex items-center text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 p-3 rounded-xl transition-colors text-left" onClick={() => { setSearchQuery('Victoria Island'); onSearchInput('Victoria Island', 'to'); }}>
                    <div className="bg-slate-800 p-2 rounded-full mr-4"><Navigation2 size={16} /></div>
                    <span className="flex-1 font-medium">Victoria Island</span>
                  </button>
                  <button className="flex items-center text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 p-3 rounded-xl transition-colors text-left" onClick={() => { setSearchQuery('Ikeja City Mall'); onSearchInput('Ikeja City Mall', 'to'); }}>
                    <div className="bg-slate-800 p-2 rounded-full mr-4"><Navigation2 size={16} /></div>
                    <span className="flex-1 font-medium">Ikeja City Mall</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-72 bg-[#111111] h-full shadow-2xl border-r border-slate-800 p-6 flex flex-col pointer-events-auto animate-in slide-in-from-left duration-300">
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={24} /></button>
            <h2 className="text-xl font-bold text-amber-500 mb-8">TrafficWise</h2>
            <div className="space-y-4 flex-1 mt-4">
              <a href="/login" className="block text-slate-300 hover:text-white font-medium text-lg hover:translate-x-1 transition-transform">Ops Console</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
