export type ProxyProtocol = 'socks5' | 'http' | 'https' | 'ssh' | 'noproxy';

export interface ProxyItem {
  id: string;
  raw: string;
  protocol: ProxyProtocol;
  host: string;
  port: string;
  username?: string;
  password?: string;
  isValid: boolean;
  formattedProxyUrl: string; // e.g., socks5://user:pass@host:port or host:port:user:pass for AdsPower
  formattedAdsPowerProxy: string;
}

export interface DeviceSpec {
  brand: string;
  model: string;
  modelPatterns: string[]; // Patterns in UA to match this model
  nativeResolution: string; // e.g. "1080x2424"
  viewport: string; // e.g. "412x915"
  screenWidth: number;
  screenHeight: number;
  dpr: number;
  touchPoints: number;
  ram: string;
  cpuCores: number;
  deviceType: 'mobile' | 'tablet';
  platform: 'android' | 'ios' | 'ipad';
}

export interface ParsedUA {
  rawUA: string;
  brand: string;
  model: string;
  osName: 'Android' | 'iOS' | 'iPadOS' | 'Windows' | 'macOS' | 'Unknown';
  osVersion: string;
  browserName: string; // Chrome, Safari, Firefox, Edge, Opera, FB App, Instagram, Samsung Browser, etc.
  browserVersion: string;
  chromeVersion?: string;
  facebookAppVersion?: string;
  isWebView: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: 'android' | 'ios' | 'ipad' | 'other';
  language: string;
  matchedDevice?: DeviceSpec;
  isUnknownDevice: boolean;
  isValidUA: boolean;
}

export type ProfileNameType = 'sequential' | 'random' | 'custom_prefix';

export type ProfileStatus = 'Ready' | 'Estimated Device' | 'Unknown Device' | 'Proxy Missing' | 'Invalid UA';

export interface AdsPowerProfile {
  id: string;
  index: number;
  name: string;
  remark: string;
  tab: string; // Separated as required by AdsPower
  platform: string;
  username: string;
  password: string;
  fakey: string;
  cookie: string;
  proxytype: string; // e.g. socks5, http, https, noproxy
  ipchecker: string;
  proxy: string; // host:port:user:pass or host:port or proxyurl
  proxyurl: string;
  ip: string;
  countrycode: string;
  regioncode: string;
  citycode: string;
  proxyid: string;
  ua: string;
  resolution: string; // e.g. "1080x2424"
  
  // Metadata for preview UI
  parsedUA: ParsedUA;
  assignedProxy?: ProxyItem;
  status: ProfileStatus;
  tabsList: string[];
}

export interface ValidationWarning {
  type: 'danger' | 'warning' | 'info';
  code: string;
  message: string;
  count?: number;
  details?: string[];
}

export type ProfileBatchCount = 1 | 10 | 100 | 500 | 1000 | 5000 | 10000;
