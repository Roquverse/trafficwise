"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Activity, ShieldAlert, Cpu, BarChart3, Navigation2, ChevronRight, AtSign } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-primary/30 selection:text-primary">
      {/* Decorative Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-amber-900/10 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-950/30 blur-[120px]" />
        
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem'
          }}
        />
      </div>

      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AtSign className="text-primary" size={28} />
            <span className="text-xl font-bold text-white tracking-tight">TrafficWise</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/ops/map" className="hover:text-white transition-colors">Ops Console</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="hidden md:inline-flex text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/map" 
              className="bg-primary hover:bg-amber-400 text-[#050505] text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              Live Map
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 md:pt-52 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Live in Lagos</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[1.1]">
            Outsmart the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-primary to-amber-500">
              Gridlock.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Predictive resilience for urban mobility. We use advanced AI to forecast congestion up to 60 minutes ahead so you can navigate the city smarter.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/map" 
              className="w-full sm:w-auto flex items-center justify-center bg-primary text-[#050505] px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-400 transition-all hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              Open Live Map
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto flex items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Showcase */}
      <section className="relative z-10 py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          <div className="space-y-2">
            <h4 className="text-3xl md:text-4xl font-bold text-white">1M+</h4>
            <p className="text-sm text-slate-500 font-medium">Daily Data Points</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl md:text-4xl font-bold text-white">94%</h4>
            <p className="text-sm text-slate-500 font-medium">Prediction Accuracy</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl md:text-4xl font-bold text-white">60m</h4>
            <p className="text-sm text-slate-500 font-medium">Forecast Horizon</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl md:text-4xl font-bold text-white">24/7</h4>
            <p className="text-sm text-slate-500 font-medium">Real-time Monitoring</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Intelligence at every turn.</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Built for commuters who value their time and city planners who need visibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Network Graph</h3>
              <p className="text-slate-400 leading-relaxed">
                Watch the city breathe. Our real-time map visualizes traffic flow across major arteries instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-teal-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Predictions</h3>
              <p className="text-slate-400 leading-relaxed">
                Powered by LSTM neural networks and Random Forests to forecast congestion before it happens.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-amber-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Navigation2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dynamic Routing</h3>
              <p className="text-slate-400 leading-relaxed">
                Get alternative routes dynamically adjusted based on predicted bottlenecks along your path.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-red-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Incident Alerts</h3>
              <p className="text-slate-400 leading-relaxed">
                Crowdsourced and automated incident reporting keeps you aware of accidents or road blocks.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group lg:col-span-2 bg-gradient-to-br from-teal-900/20 to-slate-900/50 border border-teal-900/30 p-8 rounded-3xl hover:border-teal-700/50 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="bg-teal-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-teal-400 mb-2">
                    <BarChart3 size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Ops Console</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">
                    A dedicated command center for city planners and fleet managers. Analyze historical trends, view confidence intervals, and manage the urban grid.
                  </p>
                  <Link href="/ops/map" className="inline-flex items-center text-teal-400 font-semibold hover:text-teal-300 transition-colors pt-2">
                    Access Ops Console <ChevronRight size={18} className="ml-1" />
                  </Link>
                </div>
                <div className="flex-1 w-full bg-[#0a0a0a] rounded-2xl border border-white/10 p-4 shadow-2xl relative overflow-hidden group-hover:border-teal-900/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="h-4 w-24 bg-white/10 rounded-md" />
                        <div className="h-6 w-16 bg-teal-500/20 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-teal-950/50 to-amber-950/30 border border-white/10 rounded-[3rem] p-12 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Ready to bypass the chaos?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join thousands of commuters making smarter routing decisions every day.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center bg-white text-[#050505] px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-all hover:scale-105 shadow-xl"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050505] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <AtSign className="text-slate-400" size={24} />
            <span className="text-lg font-bold text-slate-200 tracking-tight">TrafficWise</span>
          </div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} TrafficWise. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy</Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms</Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
