/**
 * Servers - Main VPN servers selection screen
 * Refactored for better organization:
 * - Components split into Header, CategoryGrid, and ServerList
 * - Styles colocated with components
 * - Logic extracted to local hooks
 */

import { useCallback, useRef, useEffect } from 'react';
import { useVpn } from '@/features/vpn';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useToastContext } from '@/shared/context/ToastContext';
import { useServerStats } from '@/shared/hooks/useServerStats';
import { useSafeArea } from '@/shared/hooks/useSafeArea';
import { useAutoFocus } from '@/shared/hooks/useAutoFocus';
import { useTranslation } from '@/i18n';
import { appLogger } from '@/features/logs';
import { useAsyncError } from '@/core/hooks';
import { ErrorCategory } from '@/core/utils/ErrorHandler';
import { useDTunnelEvent } from '@/lib/dtunnel-sdk-react';
import { ErrorDisplay } from '@/core/components';
import { ScrollIndicator } from '@/shared/ui/ScrollIndicator';

// Componentes locales
import { ServersHeader } from './components/ServersHeader';
import { CategoryGrid } from './components/CategoryGrid';
import { ServerList } from './components/ServerList';

// Hooks locales
import { useServersFilter, useServersExpand, useServersKeyboard, useGroupedServers } from './hooks';

import type { Category, ServerConfig } from '@/core/types';
import './Servers.css';

export function ServersScreen() {
  // VPN State
  const {
    status,
    categorias,
    config: currentConfig,
    setConfig,
    setScreen,
    startAutoConnect,
    disconnect,
    cancelConnecting,
    creds,
    autoMode,
    selectedCategory,
    setSelectedCategory,
  } = useVpn();

  // UI State
  const { t } = useTranslation();
  const { showToast } = useToastContext();
  const { statusBarHeight } = useSafeArea();
  const sectionStyle = { paddingTop: `calc(${statusBarHeight}px + 8px)`, paddingBottom: 0 };
  const contentRef = useRef<HTMLDivElement>(null);

  // Error Handling
  const error = useAsyncError();

  // Custom Hooks
  const { serversByName, data: serverStats } = useServerStats({ pollMs: 3_000, enabled: true });
  const totalOnline = serverStats?.totalUsers ?? null;
  const { expandedCategories, toggleExpand } = useServersExpand();

  const {
    searchTerm,
    setSearchTerm,
    subcategoryFilter,
    setSubcategoryFilter,
    filteredCategories,
    visibleGroups,
  } = useServersFilter(categorias, selectedCategory);

  // Keyboard navigation + focus management (consolidated)
  useServersKeyboard(contentRef, selectedCategory);

  // Cuando se entra a una categoría, enfocar el primer elemento disponible
  useEffect(() => {
    if (!selectedCategory) return;
    const root = contentRef.current;
    if (!root) return;
    const selector = 'button, [role="button"], a, [tabindex]:not([tabindex="-1"])';
    const timer = window.setTimeout(() => {
      const el = Array.from(root.querySelectorAll<HTMLElement>(selector)).find(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      );
      el?.focus();
    }, 40);
    return () => window.clearTimeout(timer);
  }, [selectedCategory]);

  // Cuando se vuelve a la lista de categorías, enfocar la categoría del servidor activo
  useAutoFocus(
    () => {
      if (selectedCategory) return null;
      const root = contentRef.current;
      if (!root) return null;

      // Buscar la categoría que contiene el servidor actualmente conectado
      if (currentConfig?.id && categorias?.length) {
        const catWithSrv = categorias.find((c) => c.items?.some((s) => s.id === currentConfig.id));
        if (catWithSrv?.name) {
          const cards = Array.from(root.querySelectorAll<HTMLElement>('.category-card'));
          const match = cards.find((card) => {
            const title = card.querySelector<HTMLElement>('.category-card__title');
            return title?.textContent?.trim() === String(catWithSrv.name);
          });
          if (match) return match;
        }
      }

      return (
        root.querySelector<HTMLElement>('.category-card') ??
        root.querySelector<HTMLElement>('[data-nav]:not(input), button, [role="button"]')
      );
    },
    [selectedCategory, categorias?.length, currentConfig?.id],
    '.servers-content',
  );

  // Callbacks
  const handleServerClick = useCallback(
    (srv: ServerConfig, cat: Category) => {
      error.clearError();

      if (autoMode) {
        try {
          startAutoConnect(cat);
          showToast(
            `${t('auto.testing')} ${cat.name || t('auto.categoryFallback')}`,
            document.activeElement as HTMLElement,
          );
        } catch (err) {
          error.setError(err, ErrorCategory.Internal);
          showToast(t('error.autoConnectFailed'), document.activeElement as HTMLElement, 'error');
        }
        return;
      }

      const performStart = (message: string) => {
        setConfig(srv);
        setScreen('home');

        // If a category card currently has focus, blur it so visual "selected" (via :focus-within)
        // does not remain active in addition to the category that contains the selected server.
        try {
          const active = document.activeElement as HTMLElement | null;
          if (active?.closest && active.closest('.category-card')) active.blur();
        } catch {}

        showToast(message, document.activeElement as HTMLElement);
        window.setTimeout(() => getSdk()?.main.startVpn(), 150);
      };

      try {
        const pushCreds = () => {
          const sdk = getSdk();
          if (!sdk) return;
          sdk.config.setUsername(creds.user);
          sdk.config.setPassword(creds.pass);
          sdk.config.setUuid(creds.uuid);
        };

        if (status === 'CONNECTING') {
          pushCreds();
          cancelConnecting();
          performStart(`${t('status.connectingTo')} ${srv.name || t('servers.inUse')}`);
          return;
        }

        if (status === 'CONNECTED') {
          pushCreds();
          disconnect();
          performStart(`${t('status.connectingTo')} ${srv.name || t('servers.inUse')}`);
          return;
        }

        performStart(t('connection.serverSelected'));
      } catch (err) {
        error.setError(err, ErrorCategory.Internal);
        appLogger.add(
          'error',
          `Server selection error: ${err instanceof Error ? err.message : String(err)}`,
        );
        showToast(t('error.connectionFailed'), document.activeElement as HTMLElement, 'error');
      }
    },
    [
      autoMode,
      startAutoConnect,
      showToast,
      status,
      creds.user,
      creds.pass,
      creds.uuid,
      cancelConnecting,
      disconnect,
      setConfig,
      setScreen,
      t,
      error,
    ],
  );

  const handleOpenConfigurator = useCallback(() => {
    try {
      error.clearError();
      appLogger.add('info', '🔧 Abriendo diálogo de configuración nativa de DTunnel');
      getSdk()?.config.openConfigDialog();
    } catch (err) {
      error.setError(err, ErrorCategory.Internal);
      appLogger.add(
        'error',
        `Error opening configurator: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }, [error]);

  // Escuchar evento newDefaultConfig para actualizar servidor cuando el usuario elige desde el diálogo nativo
  useDTunnelEvent('newDefaultConfig', () => {
    const newCfg = getSdk()?.config.getDefaultConfig<ServerConfig>() ?? null;
    if (newCfg?.id) {
      setConfig(newCfg);
      appLogger.add('info', `✅ Servidor actualizado via newDefaultConfig: ${newCfg.name}`);
    }
  });

  // Compute grouped servers when category is selected
  const groupedServers = useGroupedServers(selectedCategory);

  return (
    <section className="screen servers-screen" style={sectionStyle}>
      <ErrorDisplay
        error={error.error}
        category={error.category}
        userMessage={error.userMessage}
        isRetryable={error.isRetryable}
        timestamp={error.timestamp}
        onDismiss={error.clearError}
      />
      <ServersHeader
        selectedCategory={selectedCategory}
        groupedServers={groupedServers}
        subcategoryFilter={subcategoryFilter}
        onSubcategoryFilter={setSubcategoryFilter}
        totalOnline={totalOnline}
        searchTerm={searchTerm}
        categorias={categorias}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
        onOpenConfigurator={handleOpenConfigurator}
      />

      <div className="servers-content" ref={contentRef}>
        {!selectedCategory ? (
          <CategoryGrid
            categorias={categorias}
            filteredCategories={filteredCategories}
            searchTerm={searchTerm}
            currentConfig={currentConfig}
            autoMode={autoMode}
            expandedCategories={expandedCategories}
            serversByName={serversByName}
            onCategoryClick={setSelectedCategory}
            onServerClick={handleServerClick}
            onToggleExpand={toggleExpand}
            onClearSearch={() => setSearchTerm('')}
            onOpenConfigurator={handleOpenConfigurator}
          />
        ) : (
          <ServerList
            selectedCategory={selectedCategory}
            visibleGroups={visibleGroups}
            currentConfig={currentConfig}
            autoMode={autoMode}
            onServerClick={handleServerClick}
          />
        )}
      </div>

      <ScrollIndicator
        targetRef={contentRef}
        dependencies={[
          selectedCategory,
          filteredCategories,
          visibleGroups,
          expandedCategories,
          searchTerm,
        ]}
      />
    </section>
  );
}
