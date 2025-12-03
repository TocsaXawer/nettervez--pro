import React from 'react';
import { DeviceType } from '../types';
import { Server, Monitor, Router, Network, Layers } from 'lucide-react';

interface ToolbarProps {
  onAddDevice: (type: DeviceType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddDevice }) => {
  const tools = [
    { type: DeviceType.ROUTER, icon: Router, label: 'Router', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    { type: DeviceType.SWITCH, icon: Network, label: 'Switch', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { type: DeviceType.MLS, icon: Layers, label: 'ML Switch', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    { type: DeviceType.SERVER, icon: Server, label: 'Szerver', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    { type: DeviceType.PC, icon: Monitor, label: 'Számítógép', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border-r border-slate-200 w-64 h-full shadow-sm z-10 overflow-y-auto">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Eszközök</h2>
      {tools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => onAddDevice(tool.type)}
          className={`flex items-center gap-3 p-3 rounded-lg border ${tool.border} ${tool.bg} hover:brightness-95 transition-all text-left shadow-sm group`}
        >
          <tool.icon className={`w-6 h-6 ${tool.color}`} />
          <div>
            <span className={`block font-semibold ${tool.color}`}>{tool.label}</span>
            <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Hozzáadás</span>
          </div>
        </button>
      ))}
      
      <div className="mt-auto p-4 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-100 space-y-2">
        <p><strong>Tipp:</strong> Kattints egy eszközre a listában a hozzáadáshoz.</p>
        <p><strong>Összekötés:</strong> Jelölj ki egy eszközt, kattints az "Összekötés" gombra (vagy nyomd meg a <strong>'C'</strong> billentyűt), majd válaszd ki a céleszközt.</p>
      </div>
    </div>
  );
};

export default Toolbar;