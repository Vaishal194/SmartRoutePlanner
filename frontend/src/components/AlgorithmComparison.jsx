import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Timer, MapPin, Target, Trophy } from 'lucide-react';

const AlgorithmComparison = ({ raceResults }) => {
  if (!raceResults) return (
      <div className="h-full flex flex-col items-center justify-center p-10 opacity-30">
          <Zap className="w-12 h-12 mb-4" />
          <div className="text-xs font-black uppercase tracking-widest text-center leading-relaxed">
              Initiate Race Mode to compare <br/> algorithmic efficiency
          </div>
      </div>
  );

  const algos = Object.entries(raceResults).map(([key, data]) => {
      if (!data) return null;
      return {
          id: key,
          name: key === 'dijkstra' ? 'Dijkstra' : key === 'astar' ? 'A* Search' : 'Greedy BFS',
          distance: Math.round(data.cost || 0),
          latency: (data.execution_time || 0).toFixed(2),
          explored: data.nodes_explored || 0,
          efficiency: (100 / ((data.nodes_explored || 1) * (data.cost || 1) / 1000)).toFixed(1),
          isOptimal: key !== 'greedy'
      };
  }).filter(Boolean);

  if (algos.length === 0) return null;

  const bestLatency = Math.min(...algos.map(a => parseFloat(a.latency)));
  const bestExplored = Math.min(...algos.map(a => a.explored));

  const astar = algos.find(a => a.id === 'astar');
  const dijkstra = algos.find(a => a.id === 'dijkstra');

  return (
    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar h-full">
      <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Benchmark comparison</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
          {algos.map((algo, i) => (
              <motion.div
                  key={algo.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-5 rounded-3xl border ${algo.isOptimal ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/30'} relative overflow-hidden`}
              >
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="text-sm font-black text-white uppercase italic tracking-tighter">{algo.name}</div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              {algo.isOptimal ? "Guaranteed Optimal" : "Heuristic Only"}
                          </div>
                      </div>
                      {parseFloat(algo.latency) === bestLatency && (
                          <div className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Fastest</div>
                      )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                      <CompactMetric label="Dist" value={algo.distance} unit="km" icon={MapPin} />
                      <CompactMetric label="Explored" value={algo.explored} unit="n" icon={Target} color={algo.explored === bestExplored ? "text-emerald-400" : "text-slate-400"} />
                      <CompactMetric label="Time" value={algo.latency} unit="ms" icon={Timer} color={parseFloat(algo.latency) === bestLatency ? "text-yellow-400" : "text-slate-400"} />
                  </div>
              </motion.div>
          ))}
      </div>

      {astar && dijkstra && (
          <div className="p-5 bg-primary-600/10 border border-primary-500/20 rounded-3xl">
              <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> System Evaluation
              </h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                  {astar.explored < dijkstra.explored 
                    ? "A* demonstrated superior efficiency by exploring fewer nodes than Dijkstra while maintaining optimality."
                    : "Heuristic evaluation balanced with path weight for real-time navigation."}
              </p>
          </div>
      )}
    </div>
  );
};

const CompactMetric = ({ label, value, unit, icon: Icon, color = "text-slate-400" }) => (
    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 uppercase mb-0.5">
            <Icon className="w-2.5 h-2.5" /> {label}
        </div>
        <div className={`text-xs font-black ${color} tabular-nums`}>
            {value} <span className="text-[8px] text-slate-700">{unit}</span>
        </div>
    </div>
);

export default AlgorithmComparison;
