import { useState, useCallback, useMemo, useEffect } from 'react';
import { useVpn } from '../features/vpn/model/VpnContext';
import { useToastContext } from '../shared/toast/ToastContext';
import { useSectionStyle } from '../shared/hooks/useSectionStyle';
import { Button } from '../shared/ui/Button';
import { formatProtocol, extractDomain, removeDomainFromDescription } from '../utils/formatUtils';
import { UI_MESSAGES } from '../constants';
import { dt } from '../features/vpn/api/vpnBridge';
import { appLogger } from '../features/logs/model/useAppLogs';
import { useServerStats } from '../shared/hooks/useServerStats';
import type { Category, ServerConfig } from '../shared/types';

const SUBCATEGORY_KEYWORDS = [
  { key: 'PRINCIPAL', label: 'Principal' },
  { key: 'JUEGOS', label: 'Juegos' },
  { key: 'STREAM', label: 'Streaming' },
  { key: 'SOCIAL', label: 'Social' },
];
const DEFAULT_SUBCATEGORY = 'Otros';
const ALL_SUBCATEGORIES = 'Todos';

const resolveSubcategory = (name?: string | null): string => {
  if (!name) return DEFAULT_SUBCATEGORY;
  const upper = name.toUpperCase();
  const match = SUBCATEGORY_KEYWORDS.find(({ key }) => upper.includes(key));
  return match ? match.label : DEFAULT_SUBCATEGORY;
};

const orderSubcategories = (labels: string[]): string[] => {
  const order = SUBCATEGORY_KEYWORDS.map(({ label }) => label);
  return labels.sort((a, b) => {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    const rankA = idxA === -1 ? order.length : idxA;
    const rankB = idxB === -1 ? order.length : idxB;
    if (rankA === rankB) return a.localeCompare(b);
    return rankA - rankB;
  });
};

export function ServersScreen() {
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
    loadCategorias,
    autoMode,
    selectedCategory,
    setSelectedCategory,
  } = useVpn();
  const { showToast } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>(ALL_SUBCATEGORIES);
  const sectionStyle = useSectionStyle();

  const { serversByName } = useServerStats({ pollMs: 3_000, enabled: true });

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  useEffect(() => {
    setSubcategoryFilter(ALL_SUBCATEGORIES);
    setSearchTerm('');
  }, [selectedCategory]);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return [...categorias]
      .filter((cat) => (cat.items?.length || 0) > 0)
      .filter((cat) => !query || cat.name.toLowerCase().includes(query))
      .sort((a, b) => {
        const sorterDiff = (a.sorter ?? Number.MAX_SAFE_INTEGER) - (b.sorter ?? Number.MAX_SAFE_INTEGER);
        if (sorterDiff !== 0) return sorterDiff;
        const countDiff = (b.items?.length || 0) - (a.items?.length || 0);
        if (countDiff !== 0) return countDiff;
        return a.name.localeCompare(b.name);
      });
  }, [categorias, searchTerm]);

  const groupedServers = useMemo(() => {
    if (!selectedCategory?.items?.length) return [];
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
        const sorterDiff = (a.sorter ?? Number.MAX_SAFE_INTEGER) - (b.sorter ?? Number.MAX_SAFE_INTEGER);
        if (sorterDiff !== 0) return sorterDiff;
        return a.name.localeCompare(b.name);
      }),
    }));
  }, [selectedCategory]);

  const visibleGroups = useMemo(() => {
    if (subcategoryFilter === ALL_SUBCATEGORIES) return groupedServers;
    return groupedServers.filter(({ label }) => label === subcategoryFilter);
  }, [groupedServers, subcategoryFilter]);

  const handleCategoryClick = useCallback((cat: Category) => {
    setSelectedCategory(cat);
  }, [setSelectedCategory]);

  const handleServerClick = useCallback((srv: ServerConfig, cat: Category) => {
    if (autoMode) {
      startAutoConnect(cat);
      showToast(UI_MESSAGES.auto.testing(cat.name || UI_MESSAGES.auto.categoryFallback));
      return;
    }

    // Switch manual: permitir cambiar de servidor aunque esté conectado
    if (status === 'CONNECTED' || status === 'CONNECTING') {
      // Asegurar que el bridge tenga las credenciales actuales
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
      showToast(UI_MESSAGES.status.connectingTo(srv.name || UI_MESSAGES.servers.inUse));

      // Esperar un poco para que el stop se procese en DTunnel
      window.setTimeout(() => {
        dt.call('DtExecuteVpnStart');
      }, 250);
      return;
    }

    setConfig(srv);
    setScreen('home');
    showToast(UI_MESSAGES.connection.serverSelected);
  }, [autoMode, startAutoConnect, showToast, status, creds.user, creds.pass, creds.uuid, cancelConnecting, disconnect, setConfig, setScreen]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleOpenNativeDialog = useCallback(() => {
    appLogger.add('info', '🔧 Abriendo diálogo de configuración nativa de DTunnel');
    dt.call('DtExecuteDialogConfig');
    
    // Polling para detectar cambios en el servidor seleccionado
    let lastConfigId: string | null = null;
    const currentConfig = dt.jsonConfigAtual as ServerConfig | null;
    if (currentConfig?.id) {
      lastConfigId = String(currentConfig.id);
    }
    
    const checkInterval = setInterval(() => {
      const newConfig = dt.jsonConfigAtual as ServerConfig | null;
      const newConfigId = newConfig?.id ? String(newConfig.id) : null;
      
      // Si el ID del servidor cambió
      if (newConfigId && newConfigId !== lastConfigId) {
        appLogger.add('info', `🔄 Cambio detectado: ${lastConfigId} → ${newConfigId}`);
        
        // Actualizar el servidor seleccionado inmediatamente
        if (newConfig && newConfig.id) {
          setConfig(newConfig);
          appLogger.add('info', `✅ Servidor actualizado: ${newConfig.name}`);
        }
        
        // Luego recargar categorías en background para sincronizar
        loadCategorias();
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
      }
    }, 300); // Más frecuente para mejor respuesta
    
    // Detener el polling después de 10 segundos
    const timeoutId = setTimeout(() => {
      appLogger.add('debug', 'Timeout de polling alcanzado');
      clearInterval(checkInterval);
    }, 10000);
  }, [loadCategorias, setConfig]);

  return (
    <section className="screen servers-screen" style={sectionStyle}>
      <div className={`section-header ${selectedCategory ? 'section-header--detail' : ''}`}>
        {selectedCategory ? (
          <>
            <div className="section-title-group">
              <span className="section-eyebrow">{UI_MESSAGES.servers.selectedEyebrow}</span>
              <div className="section-title-line">
                <div className="divider-title" aria-label={`Categoría ${selectedCategory.name}`}>
                  <span className="divider-line" aria-hidden="true" />
                  <div className="panel-title panel-title--divider">{selectedCategory.name}</div>
                  <span className="divider-line" aria-hidden="true" />
                </div>
              </div>
              <small className="section-subtitle">{UI_MESSAGES.servers.selectedSubtitle}</small>
            </div>
            {groupedServers.length > 0 && (
              <div className="subcategory-chips subcategory-chips--header" role="tablist">
                {[ALL_SUBCATEGORIES, ...groupedServers.map(({ label }) => label)].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`chip ${label === subcategoryFilter ? 'chip-active' : ''}`}
                    onClick={() => setSubcategoryFilter(label)}
                    role="tab"
                    aria-selected={label === subcategoryFilter}
                  >
                    {label === ALL_SUBCATEGORIES ? ALL_SUBCATEGORIES : label}
                    <span className="chip-count">
                      {label === ALL_SUBCATEGORIES
                        ? selectedCategory.items?.length || 0
                        : groupedServers.find((group) => group.label === label)?.servers.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="panel-title">{UI_MESSAGES.servers.title}</div>
            <p className="section-subtitle">{UI_MESSAGES.servers.subtitle}</p>
          </>
        )}

      </div>

      <div className="servers-content">
        {!selectedCategory && (
          <div className="category-toolbar">
            <div className="search-field">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={UI_MESSAGES.servers.searchPlaceholder}
              />
              {searchTerm && (
                <button type="button" className="clear-btn" onClick={handleClearSearch} aria-label={UI_MESSAGES.servers.clearSearchAria}>
                  <i className="fas fa-times" aria-hidden="true" />
                </button>
              )}
            </div>
            {categorias.length > 0 && (
              <button 
                type="button" 
                className="config-btn" 
                onClick={handleOpenNativeDialog}
                title={UI_MESSAGES.servers.openConfiguratorTitle}
              >
                <i className="fas fa-cog" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {!selectedCategory ? (
          // Lista de categorías
          categorias.length === 0 ? (
            <div className="empty-result">
              <i className="fas fa-wifi" aria-hidden="true" />
              <p>{UI_MESSAGES.servers.noServers}</p>
              <small className="muted">{UI_MESSAGES.servers.checkConfigs}</small>
              <Button onClick={handleOpenNativeDialog} className="empty-result-btn">
                <i className="fas fa-cog" aria-hidden="true" style={{ marginRight: '8px' }} />
                {UI_MESSAGES.servers.openConfigurator}
              </Button>
            </div>
          ) : (
            <div className="category-grid">
              {filteredCategories.length === 0 ? (
                <div className="empty-result">
                  <i className="fas fa-map-marker-alt" aria-hidden="true" />
                  <p>{UI_MESSAGES.servers.noSearchResults(searchTerm)}</p>
                  <small className="muted">{UI_MESSAGES.servers.noSearchHint}</small>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button variant="soft" onClick={handleClearSearch}>
                      <i className="fas fa-redo" aria-hidden="true" style={{ marginRight: '8px' }} />
                      {UI_MESSAGES.servers.clearSearch}
                    </Button>
                    <Button onClick={handleOpenNativeDialog}>
                      <i className="fas fa-cog" aria-hidden="true" style={{ marginRight: '8px' }} />
                      {UI_MESSAGES.servers.configurator}
                    </Button>
                  </div>
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const hasSelectedServer = currentConfig && cat.items?.some(srv => srv.id === currentConfig.id);
                  const first = cat.items?.[0];
                  const live = serversByName.getBestMatch(
                    `${cat.name || ''} ${first?.name || ''} ${first?.description || ''}`.trim()
                  );
                  return (
                  <button
                    key={cat.name}
                    type="button"
                    className={`category-card ${hasSelectedServer ? 'selected' : ''}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <div className="category-card__header">
                      <div>
                        <p className="category-card__title">{cat.name}</p>
                        <small className="muted">{UI_MESSAGES.servers.serverCount(cat.items.length)}</small>
                      </div>
                      <span className="badge-count" title="Usuarios conectados">
                        <i className="fas fa-users" aria-hidden="true" />
                        {live?.connectedUsers ?? '-'}
                      </span>
                    </div>
                    <div className="category-card__body">
                      <span className="category-card__label">{UI_MESSAGES.servers.subcategories}</span>
                      <div className="category-pills">
                        {Array.from(new Set(cat.items.map((srv) => resolveSubcategory(srv.name)))).slice(0, 4).map((label) => (
                          <span key={label} className="pill">{label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="category-card__footer">
                      <span>{autoMode ? UI_MESSAGES.servers.autoTest : UI_MESSAGES.servers.manualSelect}</span>
                      <i className="fas fa-chevron-right" aria-hidden="true" />
                    </div>
                  </button>
                );
                })
              )}
            </div>
          )
        ) : (
          // Lista de servidores de la categoría
          <>
            {visibleGroups.length === 0 ? (
              <div className="empty-result">
                <i className="fas fa-info-circle" aria-hidden="true" />
                <p>{UI_MESSAGES.servers.noServersInSubcategory}</p>
              </div>
            ) : (
              visibleGroups.map(({ label, servers }) => (
                <div key={label} className="subcategory-block">
                  <div className="subcategory-title">--- {label} ---</div>
                  <div className="server-grid">
                    {servers.map((srv) => {
                      const isActive = currentConfig?.id === srv.id;
                      const protocolLabel = formatProtocol(srv.mode) || srv.mode;
                      const actionLabel = autoMode ? UI_MESSAGES.servers.autoModeActive : UI_MESSAGES.servers.tapToConnect;
                      const domain = extractDomain(srv.description);
                      const cleanDescription = removeDomainFromDescription(srv.description);
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          className={`server-item ${isActive ? 'selected' : ''}`}
                          onClick={() => handleServerClick(srv, selectedCategory)}
                        >
                          <div className="server-item__header">
                            <div>
                              <p className="server-item__title">{srv.name}</p>
                              {srv.ip && <small className="server-item__ip">{srv.ip}</small>}
                            </div>
                            <div className="server-item__badges">
                              <span className="pill pill-soft">{protocolLabel}</span>
                              {domain && <span className="badge badge-domain">{domain}</span>}
                              {isActive && <span className="badge badge-active">{UI_MESSAGES.servers.inUse}</span>}
                            </div>
                          </div>
                          {cleanDescription && (
                            <p className="server-item__description">{cleanDescription}</p>
                          )}
                          <div className="server-item__footer">
                            <span>{actionLabel}</span>
                            <i className="fas fa-chevron-right" aria-hidden="true" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </section>
  );
}
