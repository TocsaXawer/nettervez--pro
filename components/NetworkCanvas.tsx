
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NetworkNode, NetworkLink, DeviceType } from '../types';
import { Server, Monitor, Router, Network, Layers } from 'lucide-react';

interface NetworkCanvasProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  onMoveNode: (id: string, x: number, y: number) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onSelectNode: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

// Icon mapper for SVG
const getIcon = (type: DeviceType) => {
  switch (type) {
    case DeviceType.ROUTER: return Router;
    case DeviceType.SWITCH: return Network;
    case DeviceType.MLS: return Layers;
    case DeviceType.SERVER: return Server;
    case DeviceType.PC: return Monitor;
    default: return Network;
  }
};

const getNodeColor = (type: DeviceType) => {
  switch (type) {
    case DeviceType.ROUTER: return '#ea580c'; // orange-600
    case DeviceType.SWITCH: return '#2563eb'; // blue-600
    case DeviceType.MLS: return '#9333ea'; // purple-600
    case DeviceType.SERVER: return '#16a34a'; // green-600
    case DeviceType.PC: return '#475569'; // slate-600
    default: return '#000';
  }
};

const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  nodes,
  links,
  onMoveNode,
  onConnectNodes,
  onSelectNode,
  selectedNodeId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'c' or 'C' to start connection if node is selected
      if (e.key.toLowerCase() === 'c' && selectedNodeId && !connectingSourceId) {
        setConnectingSourceId(selectedNodeId);
      }
      // 'Escape' to cancel connection or selection
      if (e.key === 'Escape') {
        if (connectingSourceId) {
          setConnectingSourceId(null);
        } else if (selectedNodeId) {
          onSelectNode(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, connectingSourceId, onSelectNode]);


  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (connectingSourceId) {
      // If we are connecting, clicking a node completes the connection
      if (connectingSourceId !== id) {
        onConnectNodes(connectingSourceId, id);
        setConnectingSourceId(null);
      } else {
        // Cancel if clicking same node
        setConnectingSourceId(null);
      }
    } else {
      // Otherwise select and start drag
      onSelectNode(id);
      setDraggingId(id);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    // Calculate SVG coordinates
    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;
    
    setMousePos({ x, y });

    if (draggingId) {
      onMoveNode(draggingId, x, y);
    }
  }, [draggingId, onMoveNode]);

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleCanvasClick = () => {
    if (!draggingId) {
      if (connectingSourceId) {
        setConnectingSourceId(null);
      } else {
        onSelectNode(null);
      }
    }
  };

  // Connection Line Draft
  const getSourceNode = () => nodes.find(n => n.id === connectingSourceId);
  const sourceNode = getSourceNode();

  // Helper to calculate port label position (fixed distance from node center)
  const getLabelPos = (x1: number, y1: number, x2: number, y2: number, distance: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return { x: x1, y: y1 };
    
    // Unit vector * distance
    return {
      x: x1 + (dx / length) * distance,
      y: y1 + (dy / length) * distance
    };
  };

  return (
    <div className="flex-1 h-full bg-slate-50 relative overflow-hidden cursor-crosshair">
      {/* Connection Mode Indicator */}
      {connectingSourceId && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-pulse z-10 select-none pointer-events-none">
          Kattints egy másik eszközre a csatlakozáshoz... (ESC a kilépéshez)
        </div>
      )}

      {/* Connection Button (Contextual) */}
      {selectedNodeId && !connectingSourceId && !draggingId && (
        <div className="absolute top-4 left-4 z-10">
             <button 
                onClick={(e) => { e.stopPropagation(); setConnectingSourceId(selectedNodeId); }}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md shadow-sm hover:bg-slate-50 font-medium flex items-center gap-2"
                title="Gyorsbillentyű: C"
             >
                <Network className="w-4 h-4" />
                Összekötés <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1 border border-slate-200">C</span>
             </button>
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full touch-none outline-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Grid Background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Links */}
        {links.map(link => {
          const source = nodes.find(n => n.id === link.sourceId);
          const target = nodes.find(n => n.id === link.targetId);
          if (!source || !target) return null;

          // Calculate label positions (approx 55px from center)
          const sourceLabelPos = getLabelPos(source.x, source.y, target.x, target.y, 55);
          const targetLabelPos = getLabelPos(target.x, target.y, source.x, source.y, 55);

          return (
            <g key={link.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#64748b"
                strokeWidth="3"
              />
              {/* Port Labels */}
              <g transform={`translate(${sourceLabelPos.x}, ${sourceLabelPos.y})`}>
                <rect x="-20" y="-10" width="40" height="20" rx="4" fill="white" fillOpacity="0.8" />
                <text textAnchor="middle" dy="4" className="text-[10px] font-mono fill-slate-700 font-bold select-none pointer-events-none">
                  {link.sourcePort}
                </text>
              </g>
              <g transform={`translate(${targetLabelPos.x}, ${targetLabelPos.y})`}>
                 <rect x="-20" y="-10" width="40" height="20" rx="4" fill="white" fillOpacity="0.8" />
                 <text textAnchor="middle" dy="4" className="text-[10px] font-mono fill-slate-700 font-bold select-none pointer-events-none">
                  {link.targetPort}
                </text>
              </g>
            </g>
          );
        })}

        {/* Draft Link Line (while connecting) */}
        {connectingSourceId && sourceNode && (
          <line
            x1={sourceNode.x}
            y1={sourceNode.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="pointer-events-none"
          />
        )}

        {/* Nodes */}
        {nodes.map(node => {
          const Icon = getIcon(node.type);
          const isSelected = selectedNodeId === node.id;
          const isConnectingSource = connectingSourceId === node.id;
          const color = getNodeColor(node.type);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              className="cursor-move"
              style={{ transition: draggingId === node.id ? 'none' : 'transform 0.1s ease-out' }}
            >
              {/* Node Selection Ring */}
              <circle
                r="35"
                fill="white"
                stroke={isSelected || isConnectingSource ? (isConnectingSource ? '#3b82f6' : '#2563eb') : '#cbd5e1'}
                strokeWidth={isSelected || isConnectingSource ? 3 : 2}
                className="transition-colors"
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
              />
              
              {/* Icon */}
              <foreignObject x="-16" y="-16" width="32" height="32" className="pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                    <Icon color={color} size={28} />
                </div>
              </foreignObject>

              {/* Labels */}
              <text y="50" textAnchor="middle" className="text-xs font-bold fill-slate-700 pointer-events-none select-none">
                {node.config.name}
              </text>
              <text y="64" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 pointer-events-none select-none">
                {node.config.ipAddress}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default NetworkCanvas;
