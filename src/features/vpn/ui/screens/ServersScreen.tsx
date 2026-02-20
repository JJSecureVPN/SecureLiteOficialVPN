/**
 * ServersScreen - Refactored
 * Main VPN servers selection screen with category browsing and server selection
 *
 * Architecture:
 * - Uses custom hooks (useServersFilter, useServersExpand, useServersKeyboard) for logic
 * - Delegates component rendering to ServersHeader, ServersContent
 * - Manages VPN state and callbacks
 * - ~200 lines (refactored from 830)
 */

import { useCallback, useRef, useEffect } from 'react';
import { useVpn } from '@/features/vpn';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import { useToastContext, useServerStats } from '@/shared';
import { useSectionStyle } from '@/shared/hooks';
import { useTranslation } from '@/i18n';
import { appLogger } from '@/features/logs';
import { useAsyncError } from '@/core/hooks';
import { keyboardNavigationManager } from '@/core/utils';
import { ErrorCategory } from '@/core/utils/ErrorHandler';
import { ErrorDisplay } from '@/core/components';
import {
  useServersFilter,
  useServersExpand,
  useServersKeyboard,
  useGroupedServers,
} from '@/features/vpn/ui/hooks';
import { ServersHeader, ServersContent } from '@/features/vpn/ui/components';
import type { Category, ServerConfig } from '@/core/types';

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
  // Reducir un poco el espacio superior en la pantalla de Servidores
  const sectionStyle = useSectionStyle(8);
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

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const selector = 'button, [role="button"], a, [tabindex]:not([tabindex="-1"])';

    if (selectedCategory) {
      const timer = window.setTimeout(() => {
        const items = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
        );
        if (items.length) items[0].focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }

    // entering categories list: prefer focusing first category card
    let mounted = true;
    const maxAttempts = 6;
    let attempt = 0;
    const timers: number[] = [];

    const tryFocus = () => {
      if (!mounted) return true;
      try {
        // If no category is expanded/selected but a server is currently active,
        // prefer focusing the category that contains that server so visual state
        // (selected + focus) points to the same category.
        if (!selectedCategory && currentConfig?.id && categorias?.length) {
          const categoryWithSelected = categorias.find((c) =>
            c.items?.some((s) => s.id === currentConfig.id),
          );
          if (categoryWithSelected?.name) {
            const cards = Array.from(root.querySelectorAll<HTMLElement>('.category-card'));
            const match = cards.find((card) => {
              const title = card.querySelector<HTMLElement>('.category-card__title');
              return title && title.textContent?.trim() === String(categoryWithSelected.name);
            });
            if (match) {
              try {
                match.focus();
              } catch {}
              try {
                keyboardNavigationManager.enable('.servers-content', { includeFormControls: true });
              } catch {}
              return true;
            }
          }
        }

        const first =
          (root.querySelector<HTMLElement>('.category-card') as HTMLElement | null) ||
          root.querySelector<HTMLElement>('[data-nav]:not(input), button, [role="button"]');
        if (first) {
          try {
            first.focus();
          } catch {}
          try {
            keyboardNavigationManager.enable('.servers-content', { includeFormControls: true });
          } catch {}
          return true;
        }
      } catch {
        /* ignore */
      }
      return false;
    };

    const schedule = () => {
      const ok = tryFocus();
      attempt++;
      if (!ok && attempt < maxAttempts) {
        timers.push(window.setTimeout(schedule, 40 * attempt));
      }
    };

    timers.push(window.setTimeout(schedule, 20));
    return () => {
      mounted = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [selectedCategory, categorias?.length, currentConfig?.id]);

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
          showToast(t('error.autoConnectFailed'), document.activeElement as HTMLElement);
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
        window.setTimeout(() => getSdk()?.main.startVpn(), 250);
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
        showToast(t('error.connectionFailed'), document.activeElement as HTMLElement);
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
      const sdk = getSdk();
      if (sdk) {
        sdk.config.openConfigDialog();
      }

      let lastConfigId: string | null = null;
      const currentConfig = getSdk()?.config.getDefaultConfig<ServerConfig>() ?? null;
      if (currentConfig?.id) {
        lastConfigId = String(currentConfig.id);
      }

      const checkInterval = setInterval(() => {
        try {
          const newConfig = getSdk()?.config.getDefaultConfig<ServerConfig>() ?? null;
          const newConfigId = newConfig?.id ? String(newConfig.id) : null;

          if (newConfigId && newConfigId !== lastConfigId) {
            appLogger.add('info', `🔄 Cambio detectado: ${lastConfigId} → ${newConfigId}`);
            if (newConfig && newConfig.id) {
              setConfig(newConfig);
              appLogger.add('info', `✅ Servidor actualizado: ${newConfig.name}`);
            }
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
          }
        } catch (err) {
          appLogger.add(
            'error',
            `Error polling config: ${err instanceof Error ? err.message : String(err)}`,
          );
          clearInterval(checkInterval);
        }
      }, 300);

      const timeoutId = setTimeout(() => {
        appLogger.add('debug', 'Timeout de polling alcanzado');
        clearInterval(checkInterval);
      }, 10000);
    } catch (err) {
      error.setError(err, ErrorCategory.Internal);
      appLogger.add(
        'error',
        `Error opening configurator: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }, [setConfig, error]);

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
      />
      <ServersContent
        contentRef={contentRef}
        selectedCategory={selectedCategory}
        filteredCategories={filteredCategories}
        visibleGroups={visibleGroups}
        expandedCategories={expandedCategories}
        currentConfig={currentConfig}
        autoMode={autoMode}
        searchTerm={searchTerm}
        categorias={categorias}
        serversByName={serversByName}
        onCategoryClick={setSelectedCategory}
        onServerClick={handleServerClick}
        onToggleExpand={toggleExpand}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
        onOpenConfigurator={handleOpenConfigurator}
      />
    </section>
  );
}
