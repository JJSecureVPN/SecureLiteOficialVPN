/**
 * ImportDesignerScreen
 * Full-screen JSON configuration designer
 * Three-step process: Category → Server → Credentials
 * MOBILE-FIRST & FULLY RESPONSIVE
 */

import { memo, useState, useCallback } from 'react';
import type { ServerConfig, Category } from '@/core/types';
import { useTranslation } from '@/i18n';
import { useToastContext, useSafeArea, Card } from '@/shared';
import '../../../../styles/components/import-designer-screen.css';

interface ImportDesignerScreenProps {
  categorias: Category[];
  onJsonGenerated: (json: string) => void;
  onCancel: () => void;
}

function randomString(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const ImportDesignerScreen = memo(function ImportDesignerScreen({
  categorias,
  onJsonGenerated,
  onCancel,
}: ImportDesignerScreenProps) {
  const { t } = useTranslation();
  const { showToast } = useToastContext();
  const { statusBarHeight, navigationBarHeight } = useSafeArea();

  // Designer state
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedServer, setSelectedServer] = useState<ServerConfig | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [uuid, setUuid] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Validation
  const isStepComplete = (stepNum: number): boolean => {
    if (stepNum === 0) return selectedCategoryIndex !== null;
    if (stepNum === 1) return selectedServer !== null;
    if (stepNum === 2) return username.trim() !== '' && password.trim() !== '';
    return false;
  };

  const canProceed = isStepComplete(step);

  // Generated JSON
  const generatedJson = {
    server: selectedServer
      ? {
          id: selectedServer.id,
          name: selectedServer.name,
          category: selectedCategoryIndex !== null ? categorias[selectedCategoryIndex]?.name : '',
        }
      : {},
    credentials: {
      username,
      password,
      ...(uuid && { uuid }),
    },
  };

  const handleSelectCategory = useCallback((catIndex: number) => {
    setSelectedCategoryIndex(catIndex);
    setSelectedServer(null);
    setStep(1);
  }, []);

  const handleSelectServer = useCallback((server: ServerConfig) => {
    setSelectedServer(server);
    setStep(2);
  }, []);

  const handleRandomizeCredentials = useCallback(() => {
    setUsername(`user_${randomString(6)}`);
    setPassword(`Pass${randomString(8)}!`);
    showToast(
      t('import.credentialsGenerated') || 'Credenciales generadas',
      document.activeElement as HTMLElement,
    );
  }, [showToast, t]);

  const handleUseJson = useCallback(() => {
    if (!canProceed) {
      showToast(
        t('import.completeAllFields') || 'Completa todos los campos',
        document.activeElement as HTMLElement,
      );
      return;
    }
    const json = JSON.stringify(generatedJson, null, 2);
    onJsonGenerated(json);
    showToast(t('import.jsonApplied') || 'JSON aplicado', document.activeElement as HTMLElement);
  }, [generatedJson, onJsonGenerated, showToast, t, canProceed]);

  const handleCopyJson = useCallback(async () => {
    try {
      const json = JSON.stringify(generatedJson, null, 2);
      await navigator.clipboard.writeText(json);
      showToast(t('import.copiedJson') || 'JSON copiado', document.activeElement as HTMLElement);
    } catch {
      showToast(t('error.copyFailed') || 'Error al copiar', document.activeElement as HTMLElement);
    }
  }, [generatedJson, showToast, t]);

  const handleBack = useCallback(() => {
    if (step === 0) {
      onCancel();
    } else {
      setStep((prev) => Math.max(0, prev - 1) as 0 | 1 | 2);
    }
  }, [step, onCancel]);

  const sectionStyle = {
    ['--nav-safe' as any]: `${navigationBarHeight}px`,
  } as const;

  const containerStyle = {
    paddingTop: `${statusBarHeight}px`,
    paddingBottom: `${navigationBarHeight}px`,
  } as const;

  return (
    <section className="screen import-designer-screen" style={sectionStyle}>
      <div className="import-container" style={containerStyle}>
        {/* Compact header: steps only, title removed */}
        <div className="import-header-sticky compact">
          {/* Progress Steps (compact) */}
          <div className="progress-bar compact">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${((step + 1) / 3) * 100}%` }} />
            </div>
            <div className="progress-labels">
              <span className={step >= 0 ? 'active' : ''}>
                <span className="step-number">1</span>
                <span className="step-text">{t('import.category') || 'Categoría'}</span>
              </span>
              <span className={step >= 1 ? 'active' : ''}>
                <span className="step-number">2</span>
                <span className="step-text">{t('import.server') || 'Servidor'}</span>
              </span>
              <span className={step >= 2 ? 'active' : ''}>
                <span className="step-number">3</span>
                <span className="step-text">{t('import.credentials') || 'Credenciales'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="import-body-scroll">
          {/* Step 0: Choose Category */}
          {step === 0 && (
            <div className="step-content animate-in">
              <div className="step-header">
                <div className="step-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4>Paso 1: {t('import.chooseCategory') || 'Elige una categoría'}</h4>
                <p className="muted">
                  {t('import.selectCategoryHint') || '¿Qué tipo de servidor VPN necesitas?'}
                </p>
              </div>

              <div className="options-grid">
                {categorias.map((cat, idx) => (
                  <Card
                    as="button"
                    key={cat.name}
                    type="button"
                    className={`option-card ${selectedCategoryIndex === idx ? 'selected' : ''}`}
                    onClick={() => handleSelectCategory(idx)}
                  >
                    <div className="option-card-content">
                      <div className="option-title">{cat.name}</div>
                      <div className="option-count">{cat.items?.length || 0} servidores</div>
                    </div>
                    {selectedCategoryIndex === idx && (
                      <div className="option-check">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Select Server */}
          {step === 1 && (
            <div className="step-content animate-in">
              <div className="step-header">
                <div className="step-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </div>
                <h4>Paso 2: {t('import.selectServer') || 'Selecciona el servidor'}</h4>
                <p className="muted">
                  Elige un servidor de la categoría{' '}
                  <strong>{categorias[selectedCategoryIndex || 0]?.name}</strong>
                </p>
              </div>

              <div className="server-list">
                {(categorias[selectedCategoryIndex || 0]?.items || []).map((server) => (
                  <Card
                    as="button"
                    key={server.id}
                    type="button"
                    className={`server-card ${selectedServer?.id === server.id ? 'selected' : ''}`}
                    onClick={() => handleSelectServer(server)}
                  >
                    <div className="server-card-content">
                      <div className="server-name">{server.name}</div>
                      {(server.ip || server.description) && (
                        <div className="server-meta">{server.ip || server.description}</div>
                      )}
                    </div>
                    {selectedServer?.id === server.id && (
                      <div className="server-check">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enter Credentials */}
          {step === 2 && (
            <div className="step-content animate-in">
              <div className="step-header">
                <div className="step-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h4>Paso 3: {t('import.credentials') || 'Credenciales de acceso'}</h4>
                <p className="muted">
                  {t('import.enterCredentialsHint') ||
                    'Ingresa tu usuario y contraseña para el VPN'}
                </p>
              </div>

              <div className="form-section">
                {/* Random Button */}
                <div style={{ marginBottom: 8 }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-02)',
                      marginBottom: 8,
                      fontWeight: 500,
                    }}
                  >
                    💡 Tip: Puedes generar credenciales de prueba con el botón de abajo
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-full"
                    onClick={handleRandomizeCredentials}
                  >
                    <span>🎲</span>
                    <span>{t('import.randomizeCreds') || 'Generar credenciales aleatorias'}</span>
                  </button>
                </div>

                {/* Username */}
                <div className="form-group">
                  <label className="form-label">
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
                    <span>{t('import.username') || 'Usuario'}</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tu_usuario"
                    autoComplete="username"
                  />
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>{t('import.password') || 'Contraseña'}</span>
                  </label>
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="tu_contraseña"
                    autoComplete="current-password"
                  />
                </div>

                {/* UUID */}
                <div className="form-group">
                  <label className="form-label">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>
                      UUID <span className="optional">(opcional)</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                    placeholder="Dejar vacío si no se necesita"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <Card className="summary-card">
                <div className="summary-header">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span>Resumen</span>
                </div>
                <div className="summary-items">
                  <div className="summary-item">
                    <span className="summary-label">Categoría:</span>
                    <span className="summary-value">
                      {categorias[selectedCategoryIndex || 0]?.name}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Servidor:</span>
                    <span className="summary-value">{selectedServer?.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Usuario:</span>
                    <span className="summary-value">{username || '—'}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sticky Footer Actions */}
        <div className="import-footer-sticky">
          {/* Preview Toggle (Step 2 only) */}
          {step === 2 && (
            <button
              type="button"
              className="btn btn-text btn-full"
              onClick={() => setShowPreview(!showPreview)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{showPreview ? 'Ocultar' : 'Ver'} JSON</span>
            </button>
          )}

          {/* Collapsible Preview */}
          {showPreview && step === 2 && (
            <Card className="preview-card animate-in">
              <pre className="json-preview">{JSON.stringify(generatedJson, null, 2)}</pre>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleCopyJson}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copiar
              </button>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {step > 0 && (
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Atrás</span>
              </button>
            )}
            {step === 2 && canProceed ? (
              <button
                type="button"
                className="btn btn-primary btn-large btn-full"
                onClick={handleUseJson}
              >
                <span>Usar configuración</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
});
