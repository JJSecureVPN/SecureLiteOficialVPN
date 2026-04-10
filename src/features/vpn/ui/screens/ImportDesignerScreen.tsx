/**
 * ImportDesignerScreen
 * Full-screen JSON configuration designer
 * Three-step process: Category → Server → Credentials
 * MOBILE-FIRST & FULLY RESPONSIVE
 */

import { memo, useState, useCallback, useMemo } from 'react';
import type { ServerConfig, Category } from '@/core/types';
import { useTranslation } from '@/i18n';
import { useSafeArea } from '@/shared/hooks/useSafeArea';
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
  const { navigationBarHeight } = useSafeArea();

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
  }, []);

  const handleUseJson = useCallback(() => {
    if (!canProceed) {
      return;
    }
    const json = JSON.stringify(generatedJson, null, 2);
    onJsonGenerated(json);
  }, [generatedJson, onJsonGenerated, canProceed]);

  const handleCopyJson = useCallback(async () => {
    try {
      const json = JSON.stringify(generatedJson, null, 2);
      await navigator.clipboard.writeText(json);
    } catch {
      // ignore
    }
  }, [generatedJson]);

  const handleBack = useCallback(() => {
    if (step === 0) {
      onCancel();
    } else {
      setStep((prev) => Math.max(0, prev - 1) as 0 | 1 | 2);
    }
  }, [step, onCancel]);

  const sectionStyle = useMemo(
    () =>
      ({
        '--nav-safe': `${navigationBarHeight}px`,
      }) as React.CSSProperties,
    [navigationBarHeight],
  );

  const stepLabels = useMemo(
    () => [
      t('import.category') || 'Categoría',
      t('import.server') || 'Servidor',
      t('import.credentials') || 'Credenciales',
    ],
    [t],
  );

  return (
    <div className="designer-screen" style={sectionStyle}>
      {/* Top bar */}
      <header className="designer-topbar">
        <button className="designer-back" onClick={handleBack}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="designer-title">
          {step === 0 ? stepLabels[0] : step === 1 ? stepLabels[1] : stepLabels[2]}
        </h2>
        <span className="designer-step-badge">{step + 1}/3</span>
      </header>

      {/* Step dots */}
      <div className="designer-dots">
        {stepLabels.map((label, i) => (
          <div key={i} className={`dot-item ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            <span className="dot" />
            <span className="dot-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="designer-body">
        {/* Step 0: Category */}
        {step === 0 && (
          <div className="designer-step">
            <p className="designer-hint">
              {t('import.selectCategoryHint') || '¿Qué tipo de servidor VPN necesitas?'}
            </p>
            <div className="designer-list">
              {categorias.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  className={`designer-option ${selectedCategoryIndex === idx ? 'selected' : ''}`}
                  onClick={() => handleSelectCategory(idx)}
                >
                  <div className="option-text">
                    <span className="option-name">{cat.name}</span>
                    <span className="option-meta">{cat.items?.length || 0} servidores</span>
                  </div>
                  <span className="option-check">
                    {selectedCategoryIndex === idx && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Server */}
        {step === 1 && (
          <div className="designer-step">
            <p className="designer-hint">
              Categoría: <strong>{categorias[selectedCategoryIndex || 0]?.name}</strong>
            </p>
            <div className="designer-list">
              {(categorias[selectedCategoryIndex || 0]?.items || []).map((server) => (
                <button
                  key={String(server.id)}
                  type="button"
                  className={`designer-option ${selectedServer?.id === server.id ? 'selected' : ''}`}
                  onClick={() => handleSelectServer(server)}
                >
                  <div className="option-text">
                    <span className="option-name">{server.name}</span>
                    {(server.ip || server.description) && (
                      <span className="option-meta">{server.ip || server.description}</span>
                    )}
                  </div>
                  <span className="option-check">
                    {selectedServer?.id === server.id && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Credentials */}
        {step === 2 && (
          <div className="designer-step">
            <div className="designer-form">
              <div className="form-field">
                <label>{t('import.username') || 'Usuario'}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu_usuario"
                  autoComplete="username"
                />
              </div>
              <div className="form-field">
                <label>{t('import.password') || 'Contraseña'}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="tu_contraseña"
                  autoComplete="current-password"
                />
              </div>
              <div className="form-field">
                <label>
                  UUID <span className="field-optional">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  placeholder="Dejar vacío si no se necesita"
                />
              </div>

              <button
                type="button"
                className="designer-random"
                onClick={handleRandomizeCredentials}
              >
                <span>🎲</span>
                <span>{t('import.randomizeCreds') || 'Generar aleatorias'}</span>
              </button>
            </div>

            {/* Summary */}
            <div className="designer-summary">
              <div className="summary-row">
                <span>Categoría</span>
                <strong>{categorias[selectedCategoryIndex || 0]?.name}</strong>
              </div>
              <div className="summary-row">
                <span>Servidor</span>
                <strong>{selectedServer?.name}</strong>
              </div>
              <div className="summary-row">
                <span>Usuario</span>
                <strong>{username || '—'}</strong>
              </div>
            </div>

            {/* Preview toggle */}
            <button
              type="button"
              className="designer-preview-toggle"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Ocultar JSON' : 'Ver JSON'}
            </button>

            {showPreview && (
              <div className="designer-preview">
                <pre>{JSON.stringify(generatedJson, null, 2)}</pre>
                <button type="button" className="designer-copy" onClick={handleCopyJson}>
                  Copiar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {step === 2 && canProceed && (
        <footer className="designer-footer">
          <button type="button" className="designer-apply" onClick={handleUseJson}>
            <span>Usar configuración</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </footer>
      )}
    </div>
  );
});
