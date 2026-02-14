/**
 * ImportConfigScreen - Refactored
 * Multi-step import flow for VPN configurations
 *
 * Architecture:
 * - Uses useImportConfig hook for state management
 * - Delegates UI to ImportInputStep, ImportSelectStep, ImportConfirmStep components
 * - Uses parseConfigJson, searchServers utilities for business logic
 * - ~180 lines (refactored from 628)
 */

import { memo, useCallback, useEffect } from 'react';
import type { ServerConfig } from '@/core/types';
import { useTranslation } from '@/i18n';
import { useVpn } from '@/features/vpn';
import { useToastContext, useSafeArea } from '@/shared';
import { useAsyncError } from '@/core/hooks';
import { ErrorCategory } from '@/core/utils/ErrorHandler';
import { ErrorDisplay } from '@/core/components';
import { useImportConfig } from '@/features/vpn/ui/hooks';
import { ImportInputStep, ImportSelectStep, ImportConfirmStep } from '@/features/vpn/ui/components';
import '../../../../styles/components/import-screen.css';

export const ImportConfigScreen = memo(function ImportConfigScreen() {
  const { categorias, loadCategorias, setConfig, setCreds, setScreen } = useVpn();
  const { showToast } = useToastContext();
  const { t } = useTranslation();
  const { statusBarHeight, navigationBarHeight } = useSafeArea();

  // Error Handling
  const error = useAsyncError();

  // Import configuration state management
  const {
    step,
    rawInput,
    parsed,
    matches,
    selectedId,
    parseError,
    setRawInput,
    setSelectedId,
    handleParse: hookHandleParse,
    handleBack: hookHandleBack,
  } = useImportConfig();

  // Load categories on mount
  useEffect(() => {
    if (!categorias || categorias.length === 0) {
      error.handleAsyncError(() => Promise.resolve(loadCategorias()), ErrorCategory.Internal);
    }
  }, [categorias, loadCategorias, error]);

  // Compile all servers from categories
  const allServers = categorias.reduce((acc: ServerConfig[], cat) => {
    if (cat.items) acc.push(...cat.items);
    return acc;
  }, []);

  // Handle parse and search for matching servers
  const handleParse = useCallback(() => {
    hookHandleParse(categorias, allServers);
  }, [categorias, allServers, hookHandleParse]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (step === 'input') {
      setScreen('home');
    } else {
      hookHandleBack();
    }
  }, [step, hookHandleBack, setScreen]);

  // Handle applying configuration
  const handleApply = useCallback(() => {
    try {
      error.clearError();
      const sel = matches.find((m) => String(m.id) === String(selectedId)) || matches[0];

      if (!sel) {
        error.setError(new Error('No server found'), ErrorCategory.Validation);
        showToast(t('import.noServerFound'), document.activeElement as HTMLElement);
        return;
      }

      setCreds({
        user: parsed?.username || '',
        pass: parsed?.password || '',
        uuid: parsed?.uuid || '',
      });

      setConfig(sel);
      showToast(
        t('import.applied') || t('import.appliedFallback'),
        document.activeElement as HTMLElement,
      );
      setScreen('home');
    } catch (err) {
      error.setError(err, ErrorCategory.Internal);
      showToast(t('error.configApplyFailed'), document.activeElement as HTMLElement);
    }
  }, [matches, selectedId, parsed, setCreds, setConfig, showToast, setScreen, t, error]);

  // Styles
  const sectionStyle = {
    ['--nav-safe' as any]: `${navigationBarHeight}px`,
  } as const;
  const containerStyle = {
    paddingTop: `calc(${statusBarHeight}px + var(--space-lg))`,
    paddingBottom: `calc(${navigationBarHeight}px + var(--space-lg))`,
  } as const;

  return (
    <section className="screen import-screen" style={sectionStyle}>
      <div className="import-container" style={containerStyle}>
        <ErrorDisplay
          error={error.error}
          category={error.category}
          userMessage={error.userMessage}
          isRetryable={error.isRetryable}
          timestamp={error.timestamp}
          onDismiss={error.clearError}
        />

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step === 'input' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <span className="step-label">{t('import.steps.input')}</span>
          </div>
          <div className="step-divider" />
          <div
            className={`step ${step === 'select' ? 'active' : step === 'confirm' ? 'completed' : ''}`}
          >
            <div className="step-number">2</div>
            <span className="step-label">{t('import.steps.select')}</span>
          </div>
          <div className="step-divider" />
          <div className={`step ${step === 'confirm' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">{t('import.steps.confirm')}</span>
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
            <h3>{t('import.title')}</h3>
            <p>{t('import.subtitle')}</p>
          </div>
        </div>

        {/* Body */}
        <div className="import-body">
          {/* Step 1: Input */}
          {step === 'input' && (
            <ImportInputStep
              rawInput={rawInput}
              parseError={parseError}
              onInputChange={setRawInput}
              onContinue={handleParse}
            />
          )}

          {/* Step 2: Select Server */}
          {step === 'select' && matches.length > 1 && (
            <ImportSelectStep
              matches={matches}
              selectedId={selectedId}
              categorias={categorias}
              onSelectServer={setSelectedId}
              onBack={handleBack}
              onContinue={() => {
                /* Already handled by parent - just re-render */
              }}
            />
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <ImportConfirmStep
              matches={matches}
              selectedId={selectedId}
              parsed={parsed}
              categorias={categorias}
              onBack={handleBack}
              onApply={handleApply}
            />
          )}
        </div>
      </div>
    </section>
  );
});
