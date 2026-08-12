"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Map as MapIcon, Activity, Settings, LogOut } from 'lucide-react';

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    // In a real app, this would check the JWT or session token for the 'Ops' role
    const mockRoleCheck = true; // Simulating successful auth for demonstration
    if (!mockRoleCheck) {
      setIsAuthorized(false);
      router.push('/');
    }
  }, [router]);

  if (!isAuthorized) return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Authenticating...</div>;

  const navItems = [
    { name: 'Dashboard', href: '/ops', icon: LayoutDashboard },
    { name: 'Live Map', href: '/ops/map', icon: MapIcon },
    { name: 'System Health', href: '/ops', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary tracking-tight">TrafficWise</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">Ops Control Center</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button onClick={() => router.push('/')} className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={20} />
            <span>Exit to Commuter</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
