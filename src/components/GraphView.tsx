import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import type { GraphData } from '../types.js';
import { Network, Info, Focus } from 'lucide-react';

interface GraphViewProps {
  graphData: GraphData;
}

export const GraphView: React.FC<GraphViewProps> = ({ graphData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'financial'>('all');
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build Cytoscape element definitions
    const elements: cytoscape.ElementDefinition[] = [];

    if (filterType === 'financial') {
      const financialEdges = (graphData.edges || []).filter(
        edge => edge.data.type === 'TRANSACTED_WITH' || edge.data.type === 'OWNED_BY'
      );
      const financialNodeIds = new Set<string>();
      financialEdges.forEach(edge => {
        financialNodeIds.add(edge.data.source);
        financialNodeIds.add(edge.data.target);
      });

      (graphData.nodes || []).forEach((node) => {
        if (node.data.type === 'BankAccount' || financialNodeIds.has(node.data.id)) {
          elements.push({
            group: 'nodes',
            data: {
              id: node.data.id,
              label: node.data.label,
              type: node.data.type,
              properties: node.data.properties,
            },
          });
        }
      });

      financialEdges.forEach((edge) => {
        elements.push({
          group: 'edges',
          data: {
            id: edge.data.id,
            source: edge.data.source,
            target: edge.data.target,
            type: edge.data.type,
          },
        });
      });
    } else {
      (graphData.nodes || []).forEach((node) => {
        elements.push({
          group: 'nodes',
          data: {
            id: node.data.id,
            label: node.data.label,
            type: node.data.type,
            properties: node.data.properties,
          },
        });
      });

      (graphData.edges || []).forEach((edge) => {
        elements.push({
          group: 'edges',
          data: {
            id: edge.data.id,
            source: edge.data.source,
            target: edge.data.target,
            type: edge.data.type,
          },
        });
      });
    }

    if (cyRef.current) {
      try {
        cyRef.current.destroy();
      } catch (_) {}
      cyRef.current = null;
    }

    if (elements.length === 0) return;

    // Create Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#475569',
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'background-color': '#3b82f6',
            'border-width': 2,
            'border-color': '#1d4ed8',
            'width': 32,
            'height': 32,
          },
        },
        {
          selector: 'node[type = "Accused"]',
          style: {
            'background-color': '#ef4444',
            'border-color': '#b91c1c',
          },
        },
        {
          selector: 'node[type = "FIR"]',
          style: {
            'background-color': '#f59e0b',
            'border-color': '#d97706',
          },
        },
        {
          selector: 'node[type = "Location"]',
          style: {
            'background-color': '#10b981',
            'border-color': '#047857',
          },
        },
        {
          selector: 'node[type = "BankAccount"]',
          style: {
            'background-color': '#8b5cf6',
            'border-color': '#6d28d9',
          },
        },
        {
          selector: 'node[type = "Evidence"]',
          style: {
            'background-color': '#06b6d4',
            'border-color': '#0e7490',
          },
        },
        {
          selector: 'node[type = "Transaction"]',
          style: {
            'background-color': '#6366f1',
            'border-color': '#4338ca',
          },
        },
        {
          selector: 'node[type = "Victim"]',
          style: {
            'background-color': '#ec4899',
            'border-color': '#be185d',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(type)',
            'font-size': '9px',
            'color': '#64748b',
            'text-rotation': 'autorotate',
            'text-margin-y': -6,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-width': 4,
            'border-color': '#f59e0b',
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 40,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 100,
      },
    });

    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    // Schedule layout refinement after container dimensions stabilize
    const frameId = requestAnimationFrame(() => {
      if (cyRef.current && !cyRef.current.destroyed()) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 30);
      }
    });

    // Set up ResizeObserver to handle pane/window resizes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (cyRef.current && !cyRef.current.destroyed()) {
          cyRef.current.resize();
          cyRef.current.fit(undefined, 30);
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
      if (cyRef.current) {
        try {
          cyRef.current.destroy();
        } catch (_) {}
        cyRef.current = null;
      }
    };
  }, [graphData, filterType]);

  const resetZoom = () => {
    if (cyRef.current && !cyRef.current.destroyed()) {
      cyRef.current.resize();
      cyRef.current.fit(undefined, 30);
      cyRef.current.center();
    }
  };

  const getPropertiesDisplay = () => {
    if (!selectedNode || !selectedNode.properties) return null;
    const props = selectedNode.properties;

    return (
      <div className="space-y-1.5 text-[11px]">
        {Object.entries(props).map(([key, val]) => {
          if (typeof val === 'object') return null;
          return (
            <div key={key} className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground capitalize font-medium">{key.replace('_', ' ')}:</span>
              <span className="font-semibold text-foreground truncate max-w-[140px]" title={String(val)}>{String(val)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const nodeColorClass = (type: string) => {
    switch (type) {
      case 'Accused': return 'bg-red-500 border-red-600';
      case 'FIR': return 'bg-amber-500 border-amber-600';
      case 'Location': return 'bg-emerald-500 border-emerald-600';
      case 'BankAccount': return 'bg-purple-500 border-purple-600';
      case 'Evidence': return 'bg-cyan-500 border-cyan-600';
      case 'Transaction': return 'bg-indigo-500 border-indigo-600';
      case 'Victim': return 'bg-pink-500 border-pink-600';
      default: return 'bg-blue-500 border-blue-600';
    }
  };

  const hasNodes = graphData && graphData.nodes && graphData.nodes.length > 0;

  return (
    <div className="flex flex-col h-full bg-card text-foreground">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Relationship Link Analysis</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter options */}
          <div className="flex bg-muted p-0.5 rounded-lg border border-border text-[10px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterType === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All Links
            </button>
            <button
              onClick={() => setFilterType('financial')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterType === 'financial' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Financial Links
            </button>
          </div>

          <button
            onClick={resetZoom}
            className="text-xs px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition-all flex items-center gap-1 active:scale-95 shadow-sm"
          >
            <Focus className="w-3.5 h-3.5" />
            Recenter
          </button>
        </div>
      </div>

      {/* Visual Canvas Container */}
      <div className="flex-1 relative min-h-0">
        {/* Cytoscape canvas div is ALWAYS mounted so dimensions remain stable */}
        <div ref={containerRef} className="absolute inset-0 z-0 bg-background/50" />

        {!hasNodes && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-card/95">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Network className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No Active Relationship Network Data</p>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-4">
              Queries regarding co-accused networks, gang links, or financial transfers will automatically render graph nodes here.
            </p>
            <div className="p-3 rounded-xl bg-muted/50 border border-border text-[11px] text-foreground shadow-sm max-w-xs">
              <span className="font-semibold text-primary block mb-1">Suggested Query:</span>
              <span className="italic text-muted-foreground">"Who are the associates of accused Geeta Reddy?"</span>
            </div>
          </div>
        )}

        {/* Selected Node Sidebar Overlay */}
        {selectedNode && (
          <div className="absolute top-3 right-3 bottom-3 w-64 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-4 z-20 flex flex-col overflow-y-auto">
            <div className="flex items-start gap-2.5 mb-3 pb-3 border-b border-border">
              <span className={`w-3.5 h-3.5 rounded-full border shrink-0 mt-1 ${nodeColorClass(selectedNode.type)}`} />
              <div className="min-w-0">
                <span className="text-[10px] bg-muted text-foreground font-semibold px-2 py-0.5 rounded-md border border-border">
                  {selectedNode.type}
                </span>
                <h3 className="text-sm font-bold text-foreground mt-1.5 break-words">{selectedNode.label}</h3>
              </div>
            </div>

            <div className="flex-1 text-xs space-y-3">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Node Properties</span>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 border border-border">
                {getPropertiesDisplay()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

