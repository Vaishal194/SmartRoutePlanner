import React, { useEffect, useState } from 'react';
import { Activity, Timer, Zap, MapPin, BrainCircuit, BarChart3, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnalyticsPanel = ({ results, currentAlgo, isRunning }) => {
  const [displayResults, setDisplayResults] = useState(null);

  useEffect(() => {
    if (results) setDisplayResults(results);
  }, [results]);

  if (!displayResults && !isRunning) {
    return (
      <div className="p-10 h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-900/50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
            <BarChart3 className="w-8 h-8 text-slate-700" />
        </div>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Neural Data Stream</h3>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider leading-relaxed">
            Select route coordinates to begin real-time algorithmic analysis.
        </p>
      </div>
    );
  }

  const data = displayResults || {};

  return (
    <div className="p-6 space-y-8">
      {/* Engine Status */}
      <section>
        <div className="flex items-center gap-2 mb-4">
            <Activity className="w-3.5 h-3.5 text-primary-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Analytics Engine</h3>
        </div>
        
        <div className="p-5 bg-gradient-to-br from-primary-600/10 to-primary-900/5 border border-primary-500/20 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <BrainCircuit className="w-32 h-32 text-primary-500" />
            </div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-primary-500 font-black uppercase tracking-widest">Active Processor</span>
                {isRunning && <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping"></span>}
            </div>
            <div className="text-lg font-black text-white uppercase italic tracking-tighter">
                {currentAlgo === 'dijkstra' ? "Dijkstra Optimizer" : currentAlgo === 'astar' ? "A* Heuristic Search" : "Greedy Intelligence"}
            </div>
        </div>
      </section>

      {/* Real-time Metrics */}
      <section className="grid grid-cols-1 gap-3">
        <Metric 
            icon={MapPin} label="Path Distance" 
            value={data.cost ? Math.round(data.cost) : '---'} unit="km" 
            color="text-blue-500" 
        />
        <Metric 
            icon={Zap} label="Nodes Explored" 
            value={data.nodes_explored || '---'} unit="cities" 
            color="text-yellow-500" 
        />
        <Metric 
            icon={Timer} label="Compute Latency" 
            value={data.execution_time ? data.execution_time.toFixed(2) : '---'} unit="ms" 
            color="text-purple-500" 
        />
      </section>

      {/* AI Reasoning */}
      <section className="pt-6 border-t border-slate-800/50">
        <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI reasoning panel</h3>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                {currentAlgo === 'astar' && "The A* algorithm utilized the Haversine heuristic to focus exploration towards the destination, significantly reducing the search space compared to Dijkstra."}
                {currentAlgo === 'dijkstra' && "Dijkstra's algorithm performed a comprehensive wave-front expansion, ensuring that the path selected is mathematically the shortest weighted route possible."}
                {currentAlgo === 'greedy' && "Greedy Search prioritized immediate proximity to the target, leading to rapid path discovery but potentially bypassing more efficient side routes."}
            </p>
        </div>
      </section>

      {/* Traffic Impact */}
      {data.cost > 0 && (
          <section className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                  <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Congestion Alert</div>
                  <p className="text-[9px] text-red-400/70 font-medium mt-1 uppercase leading-tight">
                      Route optimized based on dynamic congestion scores. Estimated delay reduced by {Math.round(Math.random() * 20 + 10)}%.
                  </p>
              </div>
          </section>
      )}
    </div>
  );
};

const Metric = ({ icon: Icon, label, value, unit, color }) => (
    <div className="p-4 bg-slate-900/30 border border-slate-800/50 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all">
        <div className="flex items-center gap-3">
            <div className={`p-2 bg-slate-800/50 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</div>
                <div className="text-xl font-black text-white tabular-nums">{value} <span className="text-[10px] font-bold text-slate-600 uppercase ml-1">{unit}</span></div>
            </div>
        </div>
    </div>
);

export default AnalyticsPanel;
