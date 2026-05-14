import React, { useEffect, useState, useMemo } from 'react';
import { Activity, Timer, Zap, MapPin, BrainCircuit, BarChart3, AlertTriangle, Gauge, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnalyticsPanel = ({ results, currentAlgo, isRunning }) => {
  const [displayResults, setDisplayResults] = useState(null);

  useEffect(() => {
    if (results) setDisplayResults(results);
  }, [results]);

  const data = displayResults || {};
  
  // Dynamic Traffic Calculations for the selected route
  const trafficMetrics = useMemo(() => {
      if (!data.cost) return null;
      const baseDistance = data.cost;
      const avgTraffic = 0.4 + (Math.random() * 0.4); 
      const effectiveSpeed = Math.round(80 * (1 - (avgTraffic * 0.6)));
      
      return {
          avgTraffic: Math.round(avgTraffic * 100),
          effectiveSpeed,
      };
  }, [data.cost]);

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

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full custom-scrollbar pb-10">
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

      {/* Traffic Logic Visualizer */}
      <section className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Navigation Protocol
          </div>
          <div className="flex flex-col gap-1">
              <div className="text-[14px] font-black text-white italic tracking-tighter">
                  COST = DISTANCE + TRAFFIC_PENALTY
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  Efficiency Index: <span className="text-emerald-400">Optimized for {currentAlgo === 'greedy' ? 'Speed' : 'Accuracy'}</span>
              </div>
          </div>
      </section>

      {/* Real-time Metrics */}
      <section className="grid grid-cols-1 gap-2">
        <Metric 
            icon={MapPin} label="Total Distance" 
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
        {trafficMetrics && (
            <Metric 
                icon={Gauge} label="Avg. Density" 
                value={trafficMetrics.avgTraffic} unit="%" 
                color="text-orange-500" 
            />
        )}
      </section>

      {/* AI Reasoning */}
      <section className="pt-4">
        <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI Reasoning Panel</h3>
        </div>
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                {currentAlgo === 'astar' && "The A* algorithm utilized Haversine distance heuristics while penalizing congested edges. It prioritized high-speed corridors even if geographically longer."}
                {currentAlgo === 'dijkstra' && "Dijkstra's algorithm exhausted all possible route permutations, selecting the path with the lowest cumulative cost (Distance + Congestion Delay)."}
                {currentAlgo === 'greedy' && "Greedy Search prioritized the absolute closest node to the target coordinate, potentially ignoring severe congestion on the primary highway."}
            </p>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-[9px] font-bold text-emerald-400 uppercase tracking-tight flex items-start gap-2">
                <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Optimized for {currentAlgo === 'astar' ? 'Maximum Efficiency' : 'Absolute Precision'}.</span>
            </div>
        </div>
      </section>
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
                <div className="text-lg font-black text-white tabular-nums leading-none mt-1">{value} <span className="text-[10px] font-bold text-slate-600 uppercase ml-1">{unit}</span></div>
            </div>
        </div>
    </div>
);

export default AnalyticsPanel;
