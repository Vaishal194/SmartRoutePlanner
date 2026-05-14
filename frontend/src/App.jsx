import React, { useState, useEffect, useCallback } from 'react';
import { getGraph, getTraffic, findRoute, findRouteRace } from './services/api';
import CytoscapeGraph from './components/CytoscapeGraph';
import ControlPanel from './components/ControlPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import RouteHistory from './components/RouteHistory';
import AlgorithmComparison from './components/AlgorithmComparison';
import { RefreshCw, Map, Zap, Play, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [graph, setGraph] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [algorithm, setAlgorithm] = useState('astar');
  const [preference, setPreference] = useState('fastest');
  const [animationSpeed, setAnimationSpeed] = useState(15);
  const [results, setResults] = useState(null);
  const [raceResults, setRaceResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('simulation'); 

  useEffect(() => {
    fetchGraph();
    const interval = setInterval(fetchTraffic, 7000); 
    return () => clearInterval(interval);
  }, []);

  const fetchGraph = async () => {
    try {
      const response = await getGraph();
      setGraph(response.data);
    } catch (err) {
      setNotification({ text: "Backend Link Failure", type: "error" });
    }
  };

  const fetchTraffic = async () => {
    try {
      const response = await getTraffic();
      if (graph) {
          setGraph(prev => ({ ...prev, edges: response.data }));
          if (results && !isRunning) {
              setNotification({ text: "Traffic Change: Rerouting Path", type: "alert" });
              handleStart();
              setTimeout(() => setNotification(null), 3000);
          }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStart = async () => {
    if (!source || !destination) return;
    setIsRunning(true);
    setIsPaused(false);
    setResults(null);
    setRaceResults(null);
    try {
      if (activeTab === 'race') {
          const response = await findRouteRace({ source, destination, preference });
          setRaceResults(response.data);
          // Animate the best one (A* by default for race visualization)
          setResults(response.data.astar);
      } else {
          const response = await findRoute(algorithm, { source, destination, preference });
          setResults(response.data);
      }
    } catch (err) {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setResults(null);
    setRaceResults(null);
    setSource('');
    setDestination('');
  };

  return (
    <div className="flex w-screen h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar: Left Controls */}
      <aside className="w-[340px] h-full flex flex-col border-r border-white/5 bg-slate-900/10 backdrop-blur-3xl z-20">
        <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Aura Route</h1>
                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mt-1 opacity-80">AI Intelligence</div>
                </div>
            </div>
        </div>

        <div className="flex p-2 gap-1 bg-black/40 m-6 rounded-2xl border border-white/5">
            {['simulation', 'race', 'history'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-xl border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'history' ? (
                <RouteHistory nodes={graph?.nodes || []} />
            ) : (
                <ControlPanel 
                  nodes={graph?.nodes || []}
                  source={source} setSource={setSource}
                  destination={destination} setDestination={setDestination}
                  algorithm={algorithm} setAlgorithm={setAlgorithm}
                  preference={preference} setPreference={setPreference}
                  animationSpeed={animationSpeed} setAnimationSpeed={setAnimationSpeed}
                  onStart={handleStart} onReset={handleReset}
                  isRunning={isRunning} isPaused={isPaused} setIsPaused={setIsPaused}
                />
            )}
            
            {/* Algorithm Legend */}
            <div className="px-8 pb-8 pt-4">
                <div className="flex items-center gap-2 mb-4 text-slate-500">
                    <Info className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Algorithm Protocol</span>
                </div>
                <div className="space-y-3">
                    <LegendItem color="bg-emerald-500" title="Dijkstra" desc="Optimal • Broad Search" />
                    <LegendItem color="bg-cyan-500" title="A*" desc="Optimal • Heuristic Guided" />
                    <LegendItem color="bg-yellow-500" title="Greedy" desc="Fast • Non-optimal" />
                </div>
            </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 h-full flex flex-col relative">
        <AnimatePresence>
            {notification && (
                <motion.div 
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    className={`absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-4 backdrop-blur-2xl border shadow-2xl pointer-events-auto ${notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'}`}
                >
                    {notification.type === 'alert' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                    <span className="text-[11px] font-black uppercase tracking-widest">{notification.text}</span>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="flex-1 bg-[#020617]">
            {graph ? (
                <CytoscapeGraph 
                    elements={graph} 
                    onNodeClick={(id) => { if(!source) setSource(id); else if(!destination) setDestination(id); }}
                    animationSteps={results?.steps}
                    animationSpeed={animationSpeed}
                    finalPath={results?.path}
                    isRunning={isRunning}
                    isPaused={isPaused}
                    onSimulationEnd={() => setIsRunning(false)}
                    source={source}
                    destination={destination}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#020617]">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-cyan-500" />
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] animate-pulse">Initializing Neural Map...</div>
                    </div>
                </div>
            )}
        </div>

        {/* Global Stats Overlay */}
        <div className="absolute bottom-10 left-10 flex gap-4 pointer-events-none">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex gap-8 shadow-2xl">
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</div>
                    <div className="text-xl font-black text-white italic tracking-tighter">{graph?.nodes?.length || 0}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Edge Connections</div>
                    <div className="text-xl font-black text-white italic tracking-tighter">{graph?.edges?.length || 0}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Network Load</div>
                    <div className="text-xl font-black text-emerald-400 italic tracking-tighter">14.2%</div>
                </div>
            </div>
        </div>
      </main>

      {/* Right Sidebar: Analytics or Race Comparison */}
      <aside className="w-[340px] h-full border-l border-white/5 bg-slate-900/10 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col">
        {activeTab === 'race' ? (
            <AlgorithmComparison raceResults={raceResults} />
        ) : (
            <AnalyticsPanel results={results} currentAlgo={algorithm} isRunning={isRunning} />
        )}
      </aside>
    </div>
  );
}

const LegendItem = ({ color, title, desc }) => (
    <div className="flex gap-3 items-center group cursor-help">
        <div className={`w-1 h-6 rounded-full ${color} opacity-40 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_currentColor]`}></div>
        <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{title}</div>
            <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">{desc}</div>
        </div>
    </div>
);

export default App;
