// News Feature - Re-exports principales

// Domain hooks
export { useNoticias } from './domain/hooks/useNoticias';
export type {
  NoticiaItem,
  NoticiasHookConfig,
  NoticiasHookReturn,
} from './domain/hooks/useNoticias';

// UI Components
export * from './ui/components/News';

// UI Screens
export { NewsScreen } from './ui/screens/NewsScreen';
