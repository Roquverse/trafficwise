import Link from "next/link";
import { ArrowRight, MapPin, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8">
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
              TrafficWise
            </h1>
            <p className="text-lg text-slate-300">
              AI-powered real-time traffic congestion prediction for Lagos.
              Navigate the city smarter.
            </p>
          </div>

          <div className="grid gap-4 py-8">
            <div className="flex items-center space-x-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="bg-primary/20 p-3 rounded-full text-primary">
                <Activity size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-100">Live Predictions</h3>
                <p className="text-sm text-slate-400">Up to 60-minute forecasts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="bg-primary/20 p-3 rounded-full text-primary">
                <MapPin size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-100">Smart Routing</h3>
                <p className="text-sm text-slate-400">Beat the bottlenecks</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/map" 
              className="flex items-center justify-center w-full bg-primary text-primary-foreground py-4 px-8 rounded-full font-bold text-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Open Live Map
              <ArrowRight className="ml-2" size={20} />
            </Link>
            
            <p className="text-sm text-slate-500">
              By continuing, you accept our PWA install prompt.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
