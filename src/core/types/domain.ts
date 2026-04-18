// Tipos para la aplicación Imperio VPN

import { SCREENS } from '../constants';

interface ServerAuth {
  username?: string;
  password?: string;
  uuid?: string;
}

export interface ServerConfig {
  id: string;
  name: string;
  description?: string;
  mode: string;
  ip?: string;
  icon?: string;
  auth?: ServerAuth;
  sorter?: number;
}

export interface Category {
  name: string;
  items: ServerConfig[];
  sorter?: number;
  maxUsers?: number;
}

export interface UserInfo {
  name: string;
  expiration_date: string;
  limit_connections: string;
  count_connections: number;
}

export interface Credentials {
  user: string;
  pass: string;
  uuid: string;
}

export type VpnStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'AUTH_FAILED'
  | 'NO_NETWORK'
  | 'STOPPING';

export type ScreenType = (typeof SCREENS)[number];

export type ActiveSheet =
  | 'promo'
  | 'logs'
  | 'account'
  | 'import'
  | 'extras'
  | 'hotspot'
  | 'repair'
  | 'community'
  | null;

export interface ServerRealtimeStat {
  serverId: number;
  serverName: string;
  location?: string;
  status?: 'online' | 'offline' | string;
  connectedUsers: number;
  cpuUsage?: number;
  memoryUsage?: number;
  cpuCores?: number;
  totalMemoryGb?: number;
  totalUsuarios?: number;
  lastUpdate?: string;
  netRecvMbps?: number;
  netSentMbps?: number;
}

export interface ServersStatsResponse {
  fetchedAt: string;
  totalUsers: number;
  onlineServers: number;
  servers: ServerRealtimeStat[];
}

// Nota: se importan tipos nativos desde './native' directamente cuando se necesitan.
