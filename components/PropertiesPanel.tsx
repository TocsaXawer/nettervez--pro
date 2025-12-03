
import React from 'react';
import { NetworkNode, DeviceType, OSType, ServiceType } from '../types';
import { X, Save, Trash2, Cpu, Settings } from 'lucide-react';

interface PropertiesPanelProps {
  node: NetworkNode | null;
  onClose: () => void;
  onUpdate: (updatedNode: NetworkNode) => void;
  onDelete: (nodeId: string) => void;
}

// Define available services per OS
const WINDOWS_SERVICES = [
  ServiceType.AD,
  ServiceType.WEB_IIS,
  ServiceType.FILE_SERVER,
  ServiceType.DNS,
  ServiceType.DHCP,
  ServiceType.FTP,
  ServiceType.EMAIL
];

const LINUX_SERVICES = [
  ServiceType.SSH,
  ServiceType.WEB_APACHE,
  ServiceType.WEB_NGINX,
  ServiceType.FILE_SERVER,
  ServiceType.DNS,
  ServiceType.DHCP,
  ServiceType.FTP,
  ServiceType.EMAIL
];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onClose, onUpdate, onDelete }) => {
  if (!node) return null;

  const handleChange = (field: string, value: any) => {
    let updatedConfig = { ...node.config, [field]: value };

    // If OS changes, filter out incompatible services
    if (field === 'os' && node.type === DeviceType.SERVER) {
      const allowedServices = value === OSType.WINDOWS_SERVER ? WINDOWS_SERVICES : LINUX_SERVICES;
      const currentServices = node.config.services || [];
      // Keep only services that exist in the new OS allowed list
      updatedConfig.services = currentServices.filter(s => allowedServices.includes(s));
    }

    onUpdate({
      ...node,
      config: updatedConfig,
    });
  };

  const handleServiceToggle = (service: ServiceType) => {
    const currentServices = node.config.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s) => s !== service)
      : [...currentServices, service];
    handleChange('services', newServices);
  };

  const getAvailableServices = () => {
    if (node.config.os === OSType.WINDOWS_SERVER) return WINDOWS_SERVICES;
    if (node.config.os === OSType.LINUX) return LINUX_SERVICES;
    return [];
  };

  const availableServices = getAvailableServices();

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Konfiguráció
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Basic Settings */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Eszköz Neve</label>
          <input
            type="text"
            value={node.config.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">IP Cím</label>
            <input
              type="text"
              placeholder="192.168.1.10"
              value={node.config.ipAddress}
              onChange={(e) => handleChange('ipAddress', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Alhálózati Maszk</label>
            <input
              type="text"
              placeholder="255.255.255.0"
              value={node.config.subnetMask}
              onChange={(e) => handleChange('subnetMask', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>

        {/* Server Specifics */}
        {node.type === DeviceType.SERVER && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Szerver Beállítások
            </h4>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Operációs Rendszer</label>
              <select
                value={node.config.os}
                onChange={(e) => handleChange('os', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={OSType.LINUX}>Linux</option>
                <option value={OSType.WINDOWS_SERVER}>Windows Server</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Szolgáltatások ({node.config.os === OSType.WINDOWS_SERVER ? 'Windows' : 'Linux'})
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-md bg-slate-50/50">
                {availableServices.length > 0 ? (
                  availableServices.map((service) => (
                    <label key={service} className="flex items-center space-x-2 p-2 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={(node.config.services || []).includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-sm text-slate-700">{service}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-2 italic">Válassz operációs rendszert a szolgáltatásokhoz.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Save className="w-4 h-4" /> Kész
        </button>
        <button
          onClick={() => onDelete(node.id)}
          className="flex items-center justify-center px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          title="Törlés"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;