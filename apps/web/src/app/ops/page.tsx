"use client";

import { Activity, Server, Database, BrainCircuit, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ingestionData = [
  { time: '10:00', records: 4500 },
  { time: '11:00', records: 4800 },
  { time: '12:00', records: 5100 },
  { time: '13:00', records: 4900 },
  { time: '14:00', records: 5300 },
];

export default function OpsDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">System Dashboard</h2>
          <p className="text-slate-400 mt-1">Traffic monitoring and ML health overview</p>
        </div>
        <div className="flex items-center bg-teal-500/10 text-teal-400 px-4 py-2 rounded-lg border border-teal-500/20">
          <span className="w-2 h-2 rounded-full bg-teal-400 mr-2 animate-pulse"></span>
          System Healthy
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Active Segments</h3>
            <MapIcon className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-100">1,248</p>
          <p className="text-sm text-slate-500 mt-2">Currently monitored</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Data Ingestion</h3>
            <Database className="text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-100">5.3k</p>
          <p className="text-sm text-slate-500 mt-2">Records / hour</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">ML Prediction Latency</h3>
            <BrainCircuit className="text-purple-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-100">42ms</p>
          <p className="text-sm text-slate-500 mt-2">Ensemble (RF + LSTM)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Active Incidents</h3>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-100">14</p>
          <p className="text-sm text-slate-500 mt-2">User reported in last hr</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <Activity className="mr-2 text-primary" size={20} />
            Data Ingestion Rate
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingestionData}>
                <defs>
                  <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="records" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRecords)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <Server className="mr-2 text-slate-400" size={20} />
            Service Health
          </h3>
          <div className="space-y-4">
            {[
              { name: 'NestJS API', status: 'Online', uptime: '99.99%', color: 'text-teal-400' },
              { name: 'FastAPI ML Engine', status: 'Online', uptime: '99.95%', color: 'text-teal-400' },
              { name: 'TimescaleDB', status: 'Online', uptime: '99.99%', color: 'text-teal-400' },
              { name: 'Redis Pub/Sub', status: 'Online', uptime: '100%', color: 'text-teal-400' },
            ].map(service => (
              <div key={service.name} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-300">{service.name}</h4>
                  <p className="text-sm text-slate-500">Uptime: {service.uptime}</p>
                </div>
                <div className={`font-bold ${service.color}`}>
                  {service.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  )
}
