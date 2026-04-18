import type {
  Category,
  Credentials,
  ScreenType,
  ServerConfig,
  UserInfo,
  VpnStatus,
} from '@/core/types';

export interface VpnContextType {
  status: VpnStatus;
  config: ServerConfig | null;
  categorias: Category[];
  selectedCategory: Category | null;
  user: UserInfo | null;
  creds: Credentials;
  screen: ScreenType;
  termsAccepted: boolean;

  setScreen: (screen: ScreenType) => void;
  setConfig: (config: ServerConfig) => void;
  setCreds: (creds: Partial<Credentials>) => void;
  setSelectedCategory: (category: Category | null) => void;
  connect: () => void;
  disconnect: () => void;
  cancelConnecting: () => void;
  loadCategorias: () => void;
  acceptTerms: () => void;

  topInfo: { op: string; ip: string; ver: string };
  pingMs: number | null;
}
