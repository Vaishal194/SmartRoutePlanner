import React, { useState, useEffect } from 'react';
import { Search, Clock, ChevronRight, History, BrainCircuit, Target, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RouteHistory = ({ nodes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSteps, setSearchSteps] = useState([]);
  const [foundCity, setFoundCity] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Binary Search Visualization with intentional delay for "effect"
  const binarySearch = async (target) => {
    if (!target) {
        setSearchSteps([]);
        setFoundCity(null);
        return;
    }
    
    setIsSearching(true);
    const sorted = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
    let low = 0;
    let high = sorted.length - 1;
    let steps = [];

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      const midVal = sorted[mid].id;
      steps.push({ low, high, mid, val: midVal });
      
      if (midVal.toLowerCase() === target.toLowerCase()) {
        setFoundCity(sorted[mid]);
        setSearchSteps(steps);
        setIsSearching(false);
        return;
      } else if (midVal.toLowerCase() < target.toLowerCase()) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    setFoundCity(null);
    setSearchSteps(steps);
    setIsSearching(false);
  };

  return (
    <div className="p-8 space-y-10">
      {/* Search Protocol */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
                <BrainCircuit className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Neural Indexer</h3>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Binary Search Protocol</div>
            </div>
        </div>
        
        <div className="relative group">
            <input 
                type="text" 
                placeholder="Query database..." 
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    binarySearch(e.target.value);
                }}
                className="w-full bg-black/40 border border-white/5 text-xs text-white p-4 pr-12 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all group-hover:border-white/10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isSearching ? <div className="w-4 h-4 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div> : <Search className="w-4 h-4 text-slate-600" />}
            </div>
        </div>

        <AnimatePresence>
            {searchSteps.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Search Traversal Log</span>
                        <span className="text-[9px] font-bold text-cyan-500 uppercase">{searchSteps.length} Iterations</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {searchSteps.map((s, i) => (
                            <motion.div 
                                key={i}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight ${i === searchSteps.length - 1 && foundCity ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/5 text-slate-500'}`}
                            >
                                <div className="w-4 h-4 flex items-center justify-center bg-black/20 rounded-md text-[8px] font-bold">{i+1}</div>
                                <div className="flex-1 italic">{s.val}</div>
                                {i === searchSteps.length - 1 && foundCity && <Target className="w-3 h-3 text-cyan-500 animate-pulse" />}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </section>

      {/* Access History */}
      <section className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-500/10 rounded-lg">
                <History className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Access History</h3>
        </div>
        
        <div className="space-y-3">
            {[
                { s: 'Bengaluru', d: 'Hubballi', a: 'A*', t: '14.2ms' },
                { s: 'Mysuru', d: 'Mangaluru', a: 'Dijkstra', t: '22.8ms' },
                { s: 'Udupi', d: 'Belagavi', a: 'Greedy', t: '5.1ms' }
            ].map((h, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-500 transition-colors shadow-[0_0_8px_rgba(6,182,212,0)] group-hover:shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                        <div>
                            <div className="text-[11px] font-black text-white uppercase italic tracking-tight">{h.s} <ArrowRight className="inline w-3 h-3 mx-1 opacity-30" /> {h.d}</div>
                            <div className="text-[9px] text-slate-600 font-bold uppercase mt-0.5">{h.a} Search • {h.t} Latency</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-cyan-500 transition-colors" />
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default RouteHistory;
