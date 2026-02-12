import { memo, useCallback, useEffect, useState } from 'react';
import type { ServerConfig } from '@/shared/types';
import { UI_MESSAGES } from '@/constants';
import { useVpn } from '@/features/vpn/model/VpnContext';
import { useToastContext } from '@/shared/toast/ToastContext';
import { appLogger } from '@/features/logs/model/useAppLogs';
import '../styles/components/import-screen.css';
import { useSafeArea } from '@/shared/hooks/useSafeArea';

export const ImportConfigScreen = memo(function ImportConfigScreen() {
  const { categorias, loadCategorias, setConfig, setCreds, setScreen } = useVpn();
  const { showToast } = useToastContext();

  const [step, setStep] = useState<'input' | 'select' | 'confirm'>('input');
  const [raw, setRaw] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<any | null>(null);
  const [matches, setMatches] = useState<ServerConfig[]>([]);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  useEffect(() => {
    if (!categorias || categorias.length === 0) loadCategorias();
  }, [categorias, loadCategorias]);

  const normalize = (v?: string) =>
    (v || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const parseSync = (text: string) => {
    if (!text) return { error: UI_MESSAGES.import.parseErrorEmpty } as const;

    // Allow JSON with comments (// and /* */) and trailing commas: strip them before parsing.
    const stripCommentsAndTrailingCommas = (input: string) => {
      let i = 0;
      let out = '';
      let inString = false;
      let stringChar = '';

      while (i < input.length) {
        const ch = input[i];
        const next = input[i + 1];

        if (!inString) {
          if (ch === '"' || ch === "'") {
            inString = true;
            stringChar = ch;
            out += ch;
            i++;
            continue;
          }

          // // single-line comment
          if (ch === '/' && next === '/') {
            i += 2;
            while (i < input.length && input[i] !== '\n') i++;
            continue;
          }

          // /* multi-line comment */
          if (ch === '/' && next === '*') {
            i += 2;
            while (i < input.length && !(input[i] === '*' && input[i + 1] === '/')) i++;
            i += 2;
            continue;
          }

          out += ch;
          i++;
        } else {
          out += ch;
          if (ch === '\\') {
            // escape sequence: include next char as-is
            if (i + 1 < input.length) {
              out += input[i + 1];
              i += 2;
            } else {
              i++;
            }
            continue;
          }

          if (ch === stringChar) {
            inString = false;
            stringChar = '';
          }
          i++;
        }
      }

      // Remove trailing commas like { ... , } and [ ... , ]
      out = out.replace(/,\s*(?=[}\]])/g, '');
      return out;
    };

    let obj: any;
    try {
      const sanitized = stripCommentsAndTrailingCommas(text);
      obj = JSON.parse(sanitized);
    } catch {
      return { error: UI_MESSAGES.import.parseErrorInvalid } as const;
    }

    const out: any = {};
    if (obj.server) {
      out.serverId = obj.server.id || obj.serverId || obj.id;
      out.serverName = obj.server.name || obj.serverName;
      out.serverHost = obj.server.host || obj.serverHost;
      out.serverCategory =
        obj.server.category || obj.server.location || obj.server.country || out.serverCategory;
    } else {
      out.serverId = obj.serverId || obj.id;
      out.serverName = obj.serverName || obj.server || obj.name;
      out.serverHost = obj.serverHost || obj.host;
      out.serverCategory = obj.category || obj.country || obj.location;
    }

    if (obj.credentials) {
      out.username = obj.credentials.username || obj.credentials.user || obj.username;
      out.password = obj.credentials.password || obj.credentials.pass || obj.password;
      out.uuid = obj.credentials.uuid || obj.uuid;
    } else {
      out.username = obj.username || obj.user;
      out.password = obj.password || obj.pass;
      out.uuid = obj.uuid;
    }

    // Buscar coincidencias
    const allServers: ServerConfig[] = [];
    categorias.forEach((c) => c.items && allServers.push(...c.items));

    const found: ServerConfig[] = [];

    if (out.serverId !== undefined && out.serverId !== null) {
      const byId = allServers.filter((s) => String(s.id) === String(out.serverId));
      found.push(...byId);
    }

    if (out.serverName) {
      const normName = normalize(out.serverName);
      const byNameExact = allServers.filter((s) => normalize(s.name) === normName);

      if (byNameExact.length) {
        found.push(...byNameExact);
      } else {
        const byNameContains = allServers.filter((s) => normalize(s.name).includes(normName));
        if (byNameContains.length) {
          found.push(...byNameContains);
        } else {
          const tokens = normName.split(' ').filter(Boolean).slice(0, 5);
          const scored = allServers
            .map((s) => {
              const sname = normalize(s.name);
              let score = 0;
              for (const t of tokens) {
                if (sname.includes(t)) score += 1;
              }
              return { s, score };
            })
            .filter((r) => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

          if (scored.length) {
            found.push(...scored.map((r) => r.s));
          }
        }
      }
    }

    if (out.serverHost) {
      const byHost = allServers.filter((s) =>
        normalize((s.description || '') + ' ' + (s.ip || '')).includes(normalize(out.serverHost)),
      );
      if (byHost.length) found.push(...byHost);
    }

    // Dedupe
    const uniq = Array.from(new Map(found.map((s) => [String(s.id), s])).values());
    let finalMatches = uniq.slice();

    // Resolver por categoría
    const desiredCat = normalize(out.serverCategory || out.serverName);
    const wantsArgentina = /ARGENTINA|\bAR\b/.test(desiredCat);
    const wantsBrasil = /BRASIL|BRAZIL|\bBR\b/.test(desiredCat);
    const wantsUsa = /USA|UNITED STATES|\bUS\b/.test(desiredCat);

    if (uniq.length > 1 && (out.serverCategory || wantsArgentina || wantsBrasil || wantsUsa)) {
      const byCategory = uniq.filter((s) => {
        const cat = categorias.find((c) => c.items?.some((i) => String(i.id) === String(s.id)));
        if (!cat) return false;
        const catName = normalize(cat.name);
        if (out.serverCategory) {
          return catName.includes(normalize(out.serverCategory));
        }
        if (wantsArgentina && /ARGENTINA|\bAR\b/.test(catName)) return true;
        if (wantsBrasil && /BRASIL|BRAZIL|\bBR\b/.test(catName)) return true;
        if (wantsUsa && /USA|UNITED STATES|\bUS\b/.test(catName)) return true;
        return false;
      });

      if (byCategory.length) finalMatches = byCategory;
    }

    if (!finalMatches.length) {
      const sample = allServers
        .slice(0, 50)
        .map((s) => {
          const cat = categorias.find((c) => c.items?.some((i) => String(i.id) === String(s.id)));
          return `${s.id}:${s.name}${cat ? ` [${cat.name}]` : ''}`;
        })
        .join(' | ');

      appLogger.add(
        'warn',
        `[ImportConfig] No matches for ${out.serverName || out.serverId || JSON.stringify(out)}; categories=${categorias.length}; totalServers=${allServers.length}; sample=${sample}`,
      );
      return { out, finalMatches, error: UI_MESSAGES.import.noServerFound } as const;
    }

    return { out, finalMatches } as const;
  };

  const handleParse = useCallback(() => {
    setParseError(null);

    if (!raw.trim()) {
      setParseError(UI_MESSAGES.import.parseErrorEmpty);
      return;
    }

    const res = parseSync(raw);

    if ('error' in res) {
      setParseError(res.error ?? UI_MESSAGES.import.parseErrorInvalid);
      return;
    }

    setParsed(res.out);
    setMatches(res.finalMatches);

    if (res.finalMatches.length === 1) {
      setSelectedId(res.finalMatches[0].id);
      setStep('confirm');
    } else if (res.finalMatches.length > 1) {
      setSelectedId(res.finalMatches[0].id);
      setStep('select');
    }
  }, [raw]);

  const handleApply = useCallback(() => {
    const sel = matches.find((m) => String(m.id) === String(selectedId)) || matches[0];

    if (!sel) {
      setParseError(UI_MESSAGES.import.noServerFound);
      return;
    }

    setCreds({
      user: parsed?.username || '',
      pass: parsed?.password || '',
      uuid: parsed?.uuid || '',
    });

    setConfig(sel);
    showToast(UI_MESSAGES.import.applied || 'Configuración aplicada correctamente');
    setScreen('home');
  }, [matches, selectedId, parsed, setCreds, setConfig, showToast, setScreen]);

  const handleBack = () => {
    if (step === 'select' || step === 'confirm') {
      setStep('input');
      setParseError(null);
    } else {
      setScreen('home');
    }
  };

  const getCategory = (server: ServerConfig) => {
    const cat = categorias.find((c) => c.items?.some((i) => String(i.id) === String(server.id)));
    return cat?.name || '';
  };

  const { statusBarHeight } = useSafeArea();
  const containerStyle = { paddingTop: `calc(${statusBarHeight}px + var(--space-lg))` } as const;

  return (
    <section className="screen import-screen">
      <div className="import-container" style={containerStyle}>
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step === 'input' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <span className="step-label">Importar</span>
          </div>
          <div className="step-divider" />
          <div
            className={`step ${step === 'select' ? 'active' : step === 'confirm' ? 'completed' : ''}`}
          >
            <div className="step-number">2</div>
            <span className="step-label">Seleccionar</span>
          </div>
          <div className="step-divider" />
          <div className={`step ${step === 'confirm' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Confirmar</span>
          </div>
        </div>

        {/* Header */}
        <div className="import-header">
          <div className="icon-wrapper">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div className="header-text">
            <h3>{UI_MESSAGES.import.title}</h3>
            <p>{UI_MESSAGES.import.subtitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className="import-body">
          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="step-content">
              <div className="info-box">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Pega aquí el JSON (solo texto, no archivos).</span>
              </div>

              <div className="divider">
                <span>pega el contenido</span>
              </div>

              <textarea
                className="config-textarea"
                placeholder='{"server": {"name": "US Server 1"}, "credentials": {"username": "user", "password": "pass"}}'
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={6}
              />

              {parseError && (
                <div className="alert alert-error">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{parseError}</span>
                </div>
              )}

              <div className="info-box">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{UI_MESSAGES.import.autoParseHint}</span>
              </div>

              <div className="button-group">
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleParse}
                  disabled={!raw.trim()}
                >
                  Continuar
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Server */}
          {step === 'select' && matches.length > 1 && (
            <div className="step-content">
              <div className="section-header">
                <h4>Encontramos {matches.length} servidores</h4>
                <p>Selecciona el que deseas configurar</p>
              </div>

              <div className="server-list">
                {matches.map((server) => {
                  const category = getCategory(server);
                  const isSelected = String(selectedId) === String(server.id);

                  return (
                    <label
                      key={String(server.id)}
                      className={`server-card ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="server"
                        checked={isSelected}
                        onChange={() => setSelectedId(server.id)}
                      />
                      <div className="server-info">
                        <div className="server-name">{server.name}</div>
                        {category && <div className="server-category">{category}</div>}
                        {server.description && (
                          <div className="server-desc">{server.description}</div>
                        )}
                      </div>
                      <div className="checkmark">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="button-group">
                <button className="btn btn-secondary" onClick={handleBack}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Atrás
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep('confirm')}
                  disabled={!selectedId}
                >
                  Continuar
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="step-content">
              <div className="success-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="8 12 11 15 16 9" />
                </svg>
              </div>

              <div className="section-header centered">
                <h4>Configuración lista</h4>
                <p>Revisa los detalles antes de aplicar</p>
              </div>

              {(() => {
                const selectedServer = matches.find((m) => String(m.id) === String(selectedId));
                if (!selectedServer) return null;
                const category = getCategory(selectedServer);

                return (
                  <div className="server-preview">
                    <div className="preview-main">
                      <div className="preview-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div className="preview-details">
                        <div className="preview-name">{selectedServer.name}</div>
                        {category && <div className="preview-category">{category}</div>}
                      </div>
                    </div>

                    {selectedServer.description && (
                      <div className="preview-description">{selectedServer.description}</div>
                    )}

                    {parsed?.username && (
                      <div className="preview-credentials">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Usuario: {parsed.username}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="button-group">
                <button className="btn btn-secondary" onClick={handleBack}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Atrás
                </button>
                <button className="btn btn-primary btn-success" onClick={handleApply}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Aplicar configuración
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
