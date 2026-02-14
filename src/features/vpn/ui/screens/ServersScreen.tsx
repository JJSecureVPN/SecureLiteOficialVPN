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
import { useVpn, dt } from '@/features/vpn';
import { useToastContext, useServerStats } from '@/shared';
import { useSectionStyle } from '@/shared/hooks';
import { useTranslation } from '@/i18n';
import { appLogger } from '@/features/logs';
import { useAsyncError } from '@/core/hooks';
import { ErrorCategory } from '@/core/utils/ErrorHandler';
import { ErrorDisplay } from '@/core/components';
import { useServersFilter, useServersExpand, useServersKeyboard } from '@/features/vpn/ui/hooks';
import { resolveSubcategory, orderSubcategories } from '@/features/vpn/ui/utils/categoryParsing';
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
  const sectionStyle = useSectionStyle();
  const contentRef = useRef<HTMLDivElement>(null);

  // Error Handling
  const error = useAsyncError();

  // Custom Hooks
  const { serversByName } = useServerStats({ pollMs: 3_000, enabled: true });
  const { expandedCategories, toggleExpand } = useServersExpand();
  const {
    searchTerm,
    setSearchTerm,
    subcategoryFilter,
    setSubcategoryFilter,
    filteredCategories,
    visibleGroups,
  } = useServersFilter(categorias, selectedCategory);

  // Keyboard Navigation
  useServersKeyboard(contentRef, selectedCategory);

  // Focus first element when category is opened
  useEffect(() => {
    if (!selectedCategory) return;
    const root = contentRef.current;
    if (!root) return;
    const selector = 'button, [role="button"], a, [tabindex]:not([tabindex="-1"])';
    const t = window.setTimeout(() => {
      const items = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      );
      if (items.length) items[0].focus();
    }, 40);
    return () => window.clearTimeout(t);
  }, [selectedCategory]);

  // Callbacks
  const handleCategoryClick = useCallback(
    (cat: Category) => {
      setSelectedCategory(cat);
    },
    [setSelectedCategory],
  );

  const handleServerClick = useCallback(
    (srv: ServerConfig, cat: Category) => {
      try {
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

        // Manual mode: disconnect current, set new server, start connection
        if (status === 'CONNECTED' || status === 'CONNECTING') {
          try {
            dt.set('DtUsername', creds.user);
            dt.set('DtPassword', creds.pass);
            dt.set('DtUuid', creds.uuid);

            if (status === 'CONNECTING') {
              cancelConnecting();
            } else {
              disconnect();
            }

            setConfig(srv);
            setScreen('home');
            showToast(
              `${t('status.connectingTo')} ${srv.name || t('servers.inUse')}`,
              document.activeElement as HTMLElement,
            );

            window.setTimeout(() => {
              dt.call('DtExecuteVpnStart');
            }, 250);
          } catch (err) {
            error.setError(err, ErrorCategory.Internal);
            showToast(t('error.connectionFailed'), document.activeElement as HTMLElement);
          }
          return;
        }

        setConfig(srv);
        setScreen('home');
        showToast(t('connection.serverSelected'), document.activeElement as HTMLElement);
      } catch (err) {
        error.setError(err, ErrorCategory.Internal);
        appLogger.add(
          'error',
          `Server selection error: ${err instanceof Error ? err.message : String(err)}`,
        );
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

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleOpenConfigurator = useCallback(() => {
    try {
      error.clearError();
      appLogger.add('info', '🔧 Abriendo diálogo de configuración nativa de DTunnel');
      dt.call('DtExecuteDialogConfig');

      let lastConfigId: string | null = null;
      const currentConfig = dt.jsonConfigAtual as ServerConfig | null;
      if (currentConfig?.id) {
        lastConfigId = String(currentConfig.id);
      }

      const checkInterval = setInterval(() => {
        try {
          const newConfig = dt.jsonConfigAtual as ServerConfig | null;
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
  const groupedServers = selectedCategory?.items?.length
    ? ((): Array<{ label: string; servers: ServerConfig[] }> => {
        const map = new Map<string, ServerConfig[]>();
        selectedCategory.items.forEach((srv) => {
          const label = resolveSubcategory(srv.name);
          const list = map.get(label) || [];
          list.push(srv);
          map.set(label, list);
        });
        return orderSubcategories(Array.from(map.keys())).map((label) => ({
          label,
          servers: (map.get(label) || []).sort((a, b) => {
            const sorterDiff =
              (a.sorter ?? Number.MAX_SAFE_INTEGER) - (b.sorter ?? Number.MAX_SAFE_INTEGER);
            if (sorterDiff !== 0) return sorterDiff;
            return a.name.localeCompare(b.name);
          }),
        }));
      })()
    : [];

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
        onCategoryClick={handleCategoryClick}
        onServerClick={handleServerClick}
        onToggleExpand={toggleExpand}
        onSearchChange={setSearchTerm}
        onClearSearch={handleClearSearch}
        onOpenConfigurator={handleOpenConfigurator}
      />
    </section>
  );
}
