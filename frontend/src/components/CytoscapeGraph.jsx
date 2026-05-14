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

  const getStylesheet = () => {
    const base = [
        {
          selector: 'node',
          style: {
            'label': 'data(id)',
            'background-color': '#0f172a',
            'color': '#94a3b8',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'width': 12,
            'height': 12,
            'border-width': 2,
            'border-color': '#334155',
            'transition-property': 'background-color, border-color, width, height, border-width, color',
            'transition-duration': `${Math.min(300, stepDuration * 0.8)}ms`,
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#1e293b',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#1e293b',
            'curve-style': 'bezier',
            'opacity': 0.3,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': `${Math.min(300, stepDuration * 0.8)}ms`,
          }
        },
        {
          selector: '.exploring',
          style: {
            'background-color': '#eab308',
            'border-color': '#fbbf24',
            'border-width': 6,
            'width': 24,
            'height': 24,
            'z-index': 100
          }
        },
        {
          selector: '.visited',
          style: {
            'background-color': '#3b82f6',
            'border-color': '#60a5fa',
            'opacity': 1,
            'width': 16,
            'height': 16,
          }
        },
        {
          selector: '.path',
          style: {
            'background-color': '#10b981',
            'border-color': '#34d399',
            'width': 24,
            'height': 24,
            'z-index': 200,
            'color': '#fff',
            'font-size': '12px'
          }
        },
        {
          selector: '.path-edge',
          style: {
            'line-color': '#10b981',
            'width': 8,
            'opacity': 1,
            'z-index': 150,
            'transition-duration': '100ms'
          }
        },
        {
            selector: '.active-edge',
            style: {
                'line-color': '#eab308',
                'width': 4,
                'opacity': 1,
                'line-style': 'dashed',
            }
        }
    ];

    if (source) {
        base.push({
            selector: `node[id="${source}"]`,
            style: {
                'background-color': '#06b6d4',
                'border-color': '#22d3ee',
                'width': 20,
                'height': 20,
                'border-width': 4,
            }
        });
    }

    if (destination) {
        base.push({
            selector: `node[id="${destination}"]`,
            style: {
                'background-color': '#8b5cf6',
                'border-color': '#a78bfa',
                'width': 20,
                'height': 20,
                'border-width': 4,
            }
        });
    }

    return base;
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

    const edges = (elements.edges || []).map((e, i) => ({ 
      data: { id: `e${i}`, ...e },
      classes: e.traffic > 0.7 ? 'high-traffic' : e.traffic > 0.4 ? 'medium-traffic' : ''
    }));

    return [...nodes, ...edges];
  }, [elements]);

  // Main Traversal Animation
  useEffect(() => {
    if (!isRunning || !animationSteps || isPaused) {
        clearInterval(timerRef.current);
        return;
    }

    // Immediately trigger first step or continue
    const runStep = () => {
        if (stepIdxRef.current >= animationSteps.length) {
            clearInterval(timerRef.current);
            if (finalPath) animatePathFlow(finalPath);
            onSimulationEnd && onSimulationEnd();
            return;
        }

        const step = animationSteps[stepIdxRef.current];
        const cy = cyRef.current;
        if (!cy) return;
        
        try {
            cy.elements('.exploring').removeClass('exploring');
            cy.elements('.active-edge').removeClass('active-edge');
            
            const node = cy.nodes(`#${step.node}`);
            if (node.length > 0) {
                node.addClass('exploring').addClass('visited');
            }
            
            if (stepIdxRef.current > 0) {
                const prevNode = animationSteps[stepIdxRef.current - 1].node;
                cy.edges(`[source="${prevNode}"][target="${step.node}"],[source="${step.node}"][target="${prevNode}"]`).addClass('active-edge');
            }
        } catch (e) {}

        stepIdxRef.current++;
    };

    timerRef.current = setInterval(runStep, stepDuration);

    return () => clearInterval(timerRef.current);
  }, [isRunning, animationSteps, animationSpeed, isPaused, finalPath, stepDuration]);

  // Path Highlighting Animation
  const animatePathFlow = (path) => {
    const cy = cyRef.current;
    if (!cy) return;
    clearInterval(pathTimerRef.current);

    try {
        cy.elements().removeClass('path path-edge active-edge exploring');
        let i = 0;
        pathTimerRef.current = setInterval(() => {
            if (i >= path.length) { clearInterval(pathTimerRef.current); return; }
            cy.nodes(`#${path[i]}`).addClass('path');
            if (i > 0) {
                cy.edges(`[source="${path[i-1]}"][target="${path[i]}"],[source="${path[i]}"][target="${path[i-1]}"]`).addClass('path-edge');
            }
            i++;
        }, stepDuration / 2); // Path highlighting is usually faster than exploration
    } catch (e) {}
  };

  useEffect(() => {
      if (cyRef.current && processedElements.length > 0) {
          cyRef.current.layout(layout).run();
          cyRef.current.fit();
      }
  }, [processedElements]);

  // Clean up timers on reset
  useEffect(() => {
      if (!isRunning) {
          clearInterval(timerRef.current);
          clearInterval(pathTimerRef.current);
          stepIdxRef.current = 0;
          if (cyRef.current) {
              cyRef.current.elements().removeClass('path path-edge active-edge exploring visited');
          }
      }
  }, [isRunning]);

  return (
    <div className="w-full h-full relative" onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
      <CytoscapeComponent
        elements={processedElements}
        style={{ width: '100%', height: '100%' }}
        layout={layout}
        stylesheet={getStylesheet()}
        cy={(cy) => {
          cyRef.current = cy;
          cy.on('tap', 'node', (e) => onNodeClick(e.target.id()));
          cy.on('mouseover', 'node', (e) => setHoverData({ type: 'node', data: e.target.data() }));
          cy.on('mouseout', 'node', () => setHoverData(null));
        }}
        className="bg-[#020617]"
      />
      
      {/* Speed Indicator */}
      {isRunning && (
          <div className="absolute top-24 left-6 bg-slate-900/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">
              Engine Speed: {animationSpeed}x
          </div>
      )}

      {hoverData && (
          <div className="fixed z-50 p-4 bg-slate-900 border border-white/10 rounded-2xl text-white text-xs pointer-events-none" style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}>
              {hoverData.data.id}
          </div>
      )}
    </div>
  );
};

export default CytoscapeGraph;
