
import React, { useState, useCallback, useRef } from 'react';
import { DeviceType, NetworkNode, NetworkLink, OSType, NetworkState } from './types';
import Toolbar from './components/Toolbar';
import NetworkCanvas from './components/NetworkCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import PortSelectorModal from './components/PortSelectorModal';
import { Share2, Info, Download, FolderOpen, Save } from 'lucide-react';

function App() {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for pending connection (waiting for port selection)
  const [pendingConnection, setPendingConnection] = useState<{sourceId: string, targetId: string} | null>(null);

  // Add a new node
  const handleAddDevice = (type: DeviceType) => {
    const id = crypto.randomUUID();
    const newNode: NetworkNode = {
      id,
      type,
      x: 150 + Math.random() * 50, // Slight offset to avoid stacking
      y: 150 + Math.random() * 50,
      config: {
        name: `${type}-${nodes.length + 1}`,
        ipAddress: '192.168.1.1',
        subnetMask: '255.255.255.0',
        os: type === DeviceType.SERVER ? OSType.LINUX : OSType.NONE,
        services: [],
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id); // Auto-select new node
  };

  // Move a node
  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, x, y } : node))
    );
  }, []);

  // Initiate connection (Open Modal)
  const handleConnectRequest = (sourceId: string, targetId: string) => {
    // Check if link already exists
    const exists = links.some(
      (l) =>
        (l.sourceId === sourceId && l.targetId === targetId) ||
        (l.sourceId === targetId && l.targetId === sourceId)
    );

    if (!exists) {
      setPendingConnection({ sourceId, targetId });
    }
  };

  // Finalize connection (Called from Modal)
  const handleConfirmConnection = (sourcePort: string, targetPort: string) => {
    if (!pendingConnection) return;

    const newLink: NetworkLink = {
      id: crypto.randomUUID(),
      sourceId: pendingConnection.sourceId,
      targetId: pendingConnection.targetId,
      sourcePort,
      targetPort
    };
    setLinks((prev) => [...prev, newLink]);
    setPendingConnection(null);
  };

  // Update Node Config
  const handleUpdateNode = (updatedNode: NetworkNode) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setLinks((prev) => prev.filter((l) => l.sourceId !== nodeId && l.targetId !== nodeId));
    setSelectedNodeId(null);
  };

  // Save Project to JSON
  const handleSaveProject = () => {
    const projectData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      nodes,
      links
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nettervezo-projekt-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load Project from JSON
  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Basic validation
        if (Array.isArray(data.nodes) && Array.isArray(data.links)) {
           setNodes(data.nodes);
           setLinks(data.links);
           setSelectedNodeId(null); // Deselect on load
           // Clear input value to allow reloading the same file
           if (fileInputRef.current) {
             fileInputRef.current.value = '';
           }
        } else {
           alert("Érvénytelen fájl formátum!");
        }
      } catch (err) {
        console.error("Failed to parse project file", err);
        alert("Hiba a fájl beolvasásakor!");
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const pendingSourceNode = pendingConnection ? nodes.find(n => n.id === pendingConnection.sourceId) || null : null;
  const pendingTargetNode = pendingConnection ? nodes.find(n => n.id === pendingConnection.targetId) || null : null;

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Share2 className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">NetTervező <span className="text-blue-600">Pro</span></h1>
            <p className="text-xs text-slate-500">Diák Projekt Munkához</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleLoadProject} 
             accept=".json" 
             className="hidden" 
           />
           <button 
             onClick={triggerFileInput}
             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
             title="Projekt betöltése"
           >
             <FolderOpen className="w-4 h-4" />
             Betöltés
           </button>
           <button 
             onClick={handleSaveProject}
             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
             title="Projekt mentése"
           >
             <Save className="w-4 h-4" />
             Mentés
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar onAddDevice={handleAddDevice} />
        
        <div className="flex-1 relative h-full">
            <NetworkCanvas
                nodes={nodes}
                links={links}
                onMoveNode={handleMoveNode}
                onConnectNodes={handleConnectRequest}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
            />
            
            {/* Empty State / Helper */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 max-w-md">
                        <Info className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Üres a vászon</h3>
                        <p className="text-slate-600">Kezdd el a tervezést a bal oldali menüből választott eszközökkel!</p>
                    </div>
                </div>
            )}
        </div>

        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
          />
        )}

        <PortSelectorModal
          isOpen={!!pendingConnection}
          sourceNode={pendingSourceNode}
          targetNode={pendingTargetNode}
          onConfirm={handleConfirmConnection}
          onCancel={() => setPendingConnection(null)}
        />
      </div>
    </div>
  );
}

export default App;
