import React from 'react';
import { Play, Pause, RotateCcw, Zap, Navigation, Settings2, SkipForward } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ControlPanel = ({ 
    nodes, source, setSource, destination, setDestination, 
    algorithm, setAlgorithm, preference, setPreference,
    onStart, onReset, isRunning, isPaused, setIsPaused,
    animationSpeed, setAnimationSpeed
}) => {
  return (
    <div className="p-6 space-y-8">
      {/* City Selector */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-primary-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Route Coordinates</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
            <div className="relative">
                <select 
                    value={source} onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 text-xs text-white p-3 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                >
                    <option value="">Source City</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500/50"></div>
            </div>
            <div className="relative">
                <select 
                    value={destination} onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 text-xs text-white p-3 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                >
                    <option value="">Destination City</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
            </div>
        </div>
      </section>

      {/* Algorithm Engine */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Heuristic Engine</h3>
        </div>
        <div className="flex flex-col gap-2">
            {[
                { id: 'dijkstra', l: 'Dijkstra', d: 'Shortest path guarantee' },
                { id: 'astar', l: 'A* Search', d: 'Heuristic-guided optimal' },
                { id: 'greedy', l: 'Greedy BFS', d: 'Aggressive target search' }
            ].map(a => (
                <button
                    key={a.id} onClick={() => setAlgorithm(a.id)}
                    className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative group",
                        algorithm === a.id ? "bg-primary-600/10 border-primary-500" : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                    )}
                >
                    <div className={cn("text-[11px] font-black uppercase tracking-widest", algorithm === a.id ? "text-primary-400" : "text-slate-400")}>{a.l}</div>
                    <div className="text-[9px] text-slate-600 font-bold group-hover:text-slate-500 transition-colors">{a.d}</div>
                    {algorithm === a.id && <div className="absolute top-4 right-4 w-1 h-4 bg-primary-500 rounded-full animate-glow"></div>}
                </button>
            ))}
        </div>
      </section>

      {/* Constraints */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-purple-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Navigation Preferences</h3>
        </div>
        <div className="flex flex-wrap gap-2">
            {['shortest', 'fastest', 'low_traffic'].map(p => (
                <button
                    key={p} onClick={() => setPreference(p)}
                    className={cn(
                        "px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                        preference === p ? "bg-slate-100 text-slate-950 border-slate-100" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600"
                    )}
                >
                    {p.replace('_', ' ')}
                </button>
            ))}
        </div>
      </section>

      {/* Control Surface */}
      <section className="pt-6 border-t border-slate-800/50 space-y-6">
        <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
                <span>Simulation Speed</span>
                <span className="text-primary-400">{animationSpeed}x</span>
            </div>
            <input 
                type="range" min="1" max="50" step="1"
                value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-primary-500 cursor-pointer"
            />
        </div>

        <div className="flex gap-2">
            {!isRunning ? (
                <button
                    onClick={onStart}
                    disabled={!source || !destination}
                    className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-30 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary-900/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Play className="w-4 h-4 fill-current" /> Initialize
                </button>
            ) : (
                <>
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                        onClick={onReset}
                        className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
      </section>
    </div>
  );
};

export default ControlPanel;
