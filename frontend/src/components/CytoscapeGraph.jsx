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
            'width': 1.5,
            'line-color': '#1e293b',
            'curve-style': 'bezier',
            'opacity': 0.2,
            'target-arrow-shape': 'none',
            'transition-property': 'line-color, width, opacity',
            'transition-duration': `${Math.min(300, stepDuration * 0.8)}ms`,
          }
        },
        {
          selector: '.exploring',
          style: {
            'background-color': '#eab308',
            'border-color': '#fbbf24',
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
            'opacity': 0.5,
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
            'width': 8,
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
                'line-color': '#eab308',
                'width': 4,
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

    const edges = (elements.edges || []).map((e) => ({ 
      data: { id: getEdgeId(e.source, e.target), ...e }
    }));

    return [...nodes, ...edges];
  }, [elements]);

  // Reset internal state and visuals when animationSteps changes (new simulation)
  useEffect(() => {
      if (animationSteps) {
          console.log("Resetting for new simulation steps");
          clearInterval(timerRef.current);
          clearInterval(pathTimerRef.current);
          stepIdxRef.current = 0;
          if (cyRef.current) {
              cyRef.current.elements().removeClass('optimal-node optimal-edge exploring-edge exploring visited particle-flow');
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
        const startReveal = () => {
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
        };

        startReveal();
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
      {isRunning && (
          <div className="absolute top-24 left-6 bg-slate-900/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">
              Navigating Network...
          </div>
      )}
      {hoverData && (
          <div className="fixed z-50 p-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest pointer-events-none shadow-2xl" style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}>
              {hoverData.data.id}
          </div>
      )}
    </div>
  );
};

export default CytoscapeGraph;
