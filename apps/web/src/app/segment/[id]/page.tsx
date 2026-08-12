"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, MapPin, Activity, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the 60-minute forecast chart
const forecastData = [
  { time: '14:00', speed: 65, congestion: 'Low' },
  { time: '14:15', speed: 50, congestion: 'Low' },
  { time: '14:30', speed: 35, congestion: 'Medium' },
  { time: '14:45', speed: 15, congestion: 'High' },
  { time: '15:00', speed: 10, congestion: 'High' },
];

export default function SegmentDetail({ params }: { params: { id: string } }) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20">
        <Link href="/map" className="p-2 mr-2 hover:bg-slate-800 rounded-full text-slate-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Third Mainland Bridge</h1>
          <p className="text-sm text-slate-400">Segment ID: {params.id || '123'}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Current Status Card */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-300 flex items-center">
              <Activity className="mr-2 text-primary" size={20} />
              Current Status
            </h2>
            <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-sm font-bold border border-orange-500/20">
              High Congestion
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-3 rounded-xl">
              <p className="text-sm text-slate-400 mb-1">Avg Speed</p>
              <p className="text-2xl font-bold text-slate-100">12 <span className="text-sm font-normal text-slate-500">km/h</span></p>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl">
              <p className="text-sm text-slate-400 mb-1">Confidence</p>
              <p className="text-2xl font-bold text-primary">89<span className="text-sm font-normal text-slate-500">%</span></p>
            </div>
          </div>
        </div>

        {/* 60-Minute Forecast Chart */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="font-semibold text-slate-300 mb-4 flex items-center">
            <Clock className="mr-2 text-primary" size={20} />
            60-Minute Forecast
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 80]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area type="monotone" dataKey="speed" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Incidents */}
        <div>
          <h2 className="font-semibold text-slate-300 mb-4 ml-1 flex items-center">
            <AlertCircle className="mr-2 text-red-500" size={20} />
            Recent Reports
          </h2>
          <div className="space-y-3">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-start">
              <div className="bg-red-500/10 p-2 rounded-lg mr-3">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Accident on Lane 1</p>
                <p className="text-sm text-slate-400">Reported 12 mins ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Reporting */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-20">
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-full shadow-lg shadow-red-900/50 flex items-center justify-center transition-colors"
        >
          <AlertCircle className="mr-2" />
          Report Incident Here
        </button>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center">
          <div className="bg-slate-800 w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-100">What's happening?</h2>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 p-2">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Accident', 'Pothole', 'Heavy Traffic', 'Flood'].map(type => (
                <button key={type} className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-slate-300 font-semibold hover:border-primary hover:text-primary transition-colors">
                  {type}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-full hover:bg-amber-400"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
