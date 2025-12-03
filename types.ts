
export enum DeviceType {
  ROUTER = 'ROUTER',
  SWITCH = 'SWITCH',
  MLS = 'MLS', // Multi Layer Switch
  SERVER = 'SERVER',
  PC = 'PC'
}

export enum OSType {
  LINUX = 'Linux',
  WINDOWS_SERVER = 'Windows Server',
  NONE = 'Nincs operációs rendszer'
}

export enum ServiceType {
  DHCP = 'DHCP',
  DNS = 'DNS',
  WEB_APACHE = 'Web (Apache)',
  WEB_NGINX = 'Web (Nginx)',
  WEB_IIS = 'Web (IIS)',
  AD = 'Active Directory',
  FILE_SERVER = 'Fájl Szerver',
  FTP = 'FTP',
  SSH = 'SSH',
  EMAIL = 'Email'
}

export interface NodeConfig {
  name: string;
  ipAddress: string;
  subnetMask: string;
  gateway?: string;
  os?: OSType; // Only for Servers/PCs
  services?: ServiceType[]; // Only for Servers
  vlan?: number; // For switches/PCs
}

export interface NetworkNode {
  id: string;
  type: DeviceType;
  x: number;
  y: number;
  config: NodeConfig;
}

export interface NetworkLink {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort: string;
  targetPort: string;
}

export interface NetworkState {
  nodes: NetworkNode[];
  links: NetworkLink[];
}