import React, { useEffect, useRef, useState, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const CytoscapeGraph = ({ 
    elements, 
    onNodeClick, 
    animationSteps, 
    animationSpeed, 
    finalPath,
    isRunning,
    isPaused,
    onSimulationEnd,
    source,
    destination
}) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const stepIdxRef = useRef(0);
  const pathTimerRef = useRef(null);

  const stepDuration = 1000 / animationSpeed;

  const layout = {
    name: 'preset',
    fit: true,
    padding: 60,
  };

  const getEdgeId = (s, t) => {
    const parts = [s, t].sort();
    return `${parts[0]}_${parts[1]}`;
  };

  const getStylesheet = () => {
    return [
        {
          selector: 'node',
          style: {
            'label': 'data(id)',
            'background-color': '#1e293b',
            'color': '#94a3b8',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'width': 12,
            'height': 12,
            'border-width': 1,
            'border-color': '#334155',
            'transition-property': 'background-color, border-color, width, height, border-width, color, box-shadow, opacity',
            'transition-duration': `${Math.min(300, stepDuration * 0.8)}ms`,
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'curve-style': 'bezier',
            'opacity': 0.4,
            'target-arrow-shape': 'none',
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '500ms'
          }
        },
        {
            selector: '.traffic-low',
            style: { 'line-color': '#22c55e', 'opacity': 0.6 }
        },
        {
            selector: '.traffic-medium',
            style: { 'line-color': '#eab308', 'opacity': 0.8, 'width': 3 }
        },
        {
            selector: '.traffic-high',
            style: { 'line-color': '#f97316', 'opacity': 0.9, 'width': 4 }
        },
        {
            selector: '.traffic-severe',
            style: { 
                'line-color': '#ef4444', 
                'opacity': 1, 
                'width': 6,
                'shadow-blur': 10,
                'shadow-color': '#ef4444',
                'shadow-opacity': 0.8
            }
        },
        {
          selector: '.exploring',
          style: {
            'background-color': '#fbbf24',
            'border-color': '#f59e0b',
            'border-width': 4,
            'width': 20,
            'height': 20,
            'z-index': 100,
            'opacity': 1
          }
        },
        {
          selector: '.visited',
          style: {
            'background-color': '#3b82f6',
            'border-color': '#60a5fa',
            'opacity': 0.6,
            'width': 14,
            'height': 14,
          }
        },
        {
          selector: '.optimal-node',
          style: {
            'background-color': '#10b981',
            'border-color': '#34d399',
            'width': 24,
            'height': 24,
            'z-index': 300,
            'color': '#fff',
            'font-size': '12px',
            'border-width': 3,
            'box-shadow': '0 0 20px #10b981',
            'opacity': 1
          }
        },
        {
          selector: '.optimal-edge',
          style: {
            'line-color': '#10b981',
            'width': 10,
            'opacity': 1,
            'z-index': 250,
            'line-style': 'solid',
            'target-arrow-color': '#10b981',
            'target-arrow-shape': 'triangle',
            'shadow-blur': 15,
            'shadow-color': '#10b981',
            'shadow-opacity': 0.8,
          }
        },
        {
            selector: '.exploring-edge',
            style: {
                'line-color': '#fbbf24',
                'width': 6,
                'opacity': 1,
                'line-style': 'dashed',
                'z-index': 150
            }
        },
        {
          selector: '.particle-flow',
          style: {
            'line-dash-pattern': [8, 12],
            'line-dash-offset': 10,
            'line-color': '#34d399'
          }
        }
    ];
  };

  const processedElements = useMemo(() => {
    if (!elements || !elements.nodes) return [];
    
    const validNodes = elements.nodes.filter(n => typeof n.lat === 'number' && typeof n.lng === 'number');
    if (validNodes.length === 0) return [];
    
    const lats = validNodes.map(n => n.lat);
    const lngs = validNodes.map(n => n.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const width = 1000;
    const height = 800;
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    const nodes = validNodes.map(n => ({
      data: { id: n.id, ...n },
      position: {
        x: ((n.lng - minLng) / lngRange) * width,
        y: height - ((n.lat - minLat) / latRange) * height,
      }
    }));

    const edges = (elements.edges || []).map((e) => {
        let trafficClass = 'traffic-low';
        if (e.traffic > 0.8) trafficClass = 'traffic-severe';
        else if (e.traffic > 0.6) trafficClass = 'traffic-high';
        else if (e.traffic > 0.3) trafficClass = 'traffic-medium';

        return { 
            data: { 
                id: getEdgeId(e.source, e.target), 
                ...e,
                speed: Math.round(80 * (1 - (e.traffic * 0.7))),
                delay: Math.round(e.distance * e.traffic * 0.5)
            },
            classes: trafficClass
        };
    });

    return [...nodes, ...edges];
  }, [elements]);

  useEffect(() => {
      if (animationSteps) {
          clearInterval(timerRef.current);
          clearInterval(pathTimerRef.current);
          stepIdxRef.current = 0;
          if (cyRef.current) {
              cyRef.current.elements('.optimal-node, .optimal-edge, .exploring-edge, .exploring, .visited, .particle-flow').removeClass('optimal-node optimal-edge exploring-edge exploring visited particle-flow');
          }
      }
  }, [animationSteps]);

  useEffect(() => {
    if (!isRunning || !animationSteps || isPaused) {
        clearInterval(timerRef.current);
        return;
    }

    const runStep = () => {
        if (stepIdxRef.current >= animationSteps.length) {
            clearInterval(timerRef.current);
            if (finalPath && finalPath.length > 0) {
                animatePathFlow(finalPath);
            } else {
                onSimulationEnd && onSimulationEnd();
            }
            return;
        }

        const step = animationSteps[stepIdxRef.current];
        const cy = cyRef.current;
        if (!cy) return;
        
        try {
            cy.elements('.exploring').removeClass('exploring');
            cy.elements('.exploring-edge').removeClass('exploring-edge');
            
            const node = cy.nodes(`#${step.node}`);
            if (node.length > 0) {
                node.addClass('exploring').addClass('visited');
            }
            
            if (stepIdxRef.current > 0) {
                const prevNode = animationSteps[stepIdxRef.current - 1].node;
                const edgeId = getEdgeId(prevNode, step.node);
                cy.edges(`#${edgeId}`).addClass('exploring-edge');
            }
        } catch (e) {}

        stepIdxRef.current++;
    };

    timerRef.current = setInterval(runStep, stepDuration);
    return () => clearInterval(timerRef.current);
  }, [isRunning, animationSteps, animationSpeed, isPaused, finalPath, stepDuration]);

  const animatePathFlow = (path) => {
    const cy = cyRef.current;
    if (!cy) return;
    clearInterval(pathTimerRef.current);

    try {
        let i = 0;
        pathTimerRef.current = setInterval(() => {
            if (i >= path.length) { 
                clearInterval(pathTimerRef.current);
                cy.elements('.optimal-edge').addClass('particle-flow');
                onSimulationEnd && onSimulationEnd();
                return; 
            }
            cy.nodes(`#${path[i]}`).addClass('optimal-node');
            if (i > 0) {
                cy.edges(`#${getEdgeId(path[i-1], path[i])}`).addClass('optimal-edge');
            }
            i++;
        }, stepDuration / 1.5);
    } catch (e) {
        onSimulationEnd && onSimulationEnd();
    }
  };

  useEffect(() => {
      if (cyRef.current && processedElements.length > 0) {
          cyRef.current.layout(layout).run();
          cyRef.current.fit();
      }
  }, [processedElements]);

  const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      });
  };

  return (
    <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden" 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
    >
      <CytoscapeComponent
        elements={processedElements}
        style={{ width: '100%', height: '100%' }}
        layout={layout}
        stylesheet={getStylesheet()}
        cy={(cy) => {
          cyRef.current = cy;
          cy.on('tap', 'node', (e) => onNodeClick(e.target.id()));
          cy.on('mouseover', 'node', (e) => setHoverData({ type: 'node', data: e.target.data() }));
          cy.on('mouseover', 'edge', (e) => setHoverData({ type: 'edge', data: e.target.data() }));
          cy.on('mouseout', 'node edge', () => setHoverData(null));
        }}
        className="bg-[#020617]"
      />
      {isRunning && (
          <div className="absolute top-24 left-6 bg-slate-900/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">
              Engine Optimization In Progress...
          </div>
      )}
      {hoverData && (
          <div 
            className="absolute z-50 p-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest pointer-events-none shadow-2xl flex flex-col gap-2 min-w-[200px]" 
            style={{ 
                left: mousePos.x + 20, 
                top: mousePos.y + 20,
                // Ensure tooltip stays inside container bounds
                maxWidth: '250px'
            }}
          >
              {hoverData.type === 'node' ? (
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      <span>{hoverData.data.id} Junction</span>
                  </div>
              ) : (
                  <>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span>{hoverData.data.source} → {hoverData.data.target}</span>
                        <span className="text-slate-500">{hoverData.data.distance}KM</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500">Traffic</span>
                            <span className={hoverData.data.traffic > 0.6 ? 'text-red-400' : hoverData.data.traffic > 0.3 ? 'text-yellow-400' : 'text-emerald-400'}>
                                {Math.round(hoverData.data.traffic * 100)}% Congested
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500">Speed</span>
                            <span className="text-white">{hoverData.data.speed} KM/H</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500">Delay</span>
                            <span className="text-orange-400">+{hoverData.data.delay} MINS</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500">Density</span>
                            <span className="text-white">{hoverData.data.traffic > 0.7 ? 'SEVERE' : hoverData.data.traffic > 0.4 ? 'HEAVY' : 'STABLE'}</span>
                        </div>
                    </div>
                  </>
              )}
          </div>
      )}
    </div>
  );
};

export default CytoscapeGraph;
