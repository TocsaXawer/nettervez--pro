
import React, { useState, useEffect } from 'react';
import { NetworkNode, DeviceType } from '../types';
import { Network, X } from 'lucide-react';

interface PortSelectorModalProps {
  isOpen: boolean;
  sourceNode: NetworkNode | null;
  targetNode: NetworkNode | null;
  onConfirm: (sourcePort: string, targetPort: string) => void;
  onCancel: () => void;
}

const getDefaultPortName = (type: DeviceType, index: number = 0): string => {
  switch (type) {
    case DeviceType.ROUTER: return `Gi0/${index}`;
    case DeviceType.SWITCH: return `Fa0/${index + 1}`;
    case DeviceType.MLS: return `Gi0/${index + 1}`;
    case DeviceType.SERVER: return `eth${index}`;
    case DeviceType.PC: return `eth${index}`;
    default: return `port${index}`;
  }
};

const PortSelectorModal: React.FC<PortSelectorModalProps> = ({
  isOpen,
  sourceNode,
  targetNode,
  onConfirm,
  onCancel
}) => {
  const [sourcePort, setSourcePort] = useState('');
  const [targetPort, setTargetPort] = useState('');

  // Reset/Set defaults when nodes change
  useEffect(() => {
    if (isOpen && sourceNode && targetNode) {
      setSourcePort(getDefaultPortName(sourceNode.type));
      setTargetPort(getDefaultPortName(targetNode.type));
    }
  }, [isOpen, sourceNode, targetNode]);

  if (!isOpen || !sourceNode || !targetNode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(sourcePort || 'port', targetPort || 'port');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            Kapcsolat Létrehozása
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            {/* Source */}
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">
                {sourceNode.config.name} ({sourceNode.type})
              </label>
              <input
                type="text"
                value={sourcePort}
                onChange={(e) => setSourcePort(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                placeholder="pl. eth0"
                autoFocus
              />
            </div>

            <div className="text-slate-300 pt-6">
               ↔
            </div>

            {/* Target */}
            <div className="flex-1 space-y-2 text-right">
              <label className="block text-xs font-bold text-slate-500 uppercase">
                 ({targetNode.type}) {targetNode.config.name}
              </label>
              <input
                type="text"
                value={targetPort}
                onChange={(e) => setTargetPort(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm text-right"
                placeholder="pl. Gi0/1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Összekötés
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortSelectorModal;
