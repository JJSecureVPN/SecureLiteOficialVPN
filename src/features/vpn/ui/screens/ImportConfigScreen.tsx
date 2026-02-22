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

import { memo, useCallback, useEffect, useMemo } from 'react';
import type { ServerConfig } from '@/core/types';
import { useTranslation } from '@/i18n';
import { useVpn } from '@/features/vpn';
import { useToastContext, useSafeArea } from '@/shared';
import { useAsyncError } from '@/core/hooks';
import { ErrorCategory } from '@/core/utils/ErrorHandler';
import { ErrorDisplay } from '@/core/components';
import { useImportConfig } from '@/features/vpn/ui/hooks';
import {
  ImportInputStep,
  ImportInputFooter,
  ImportSelectStep,
  ImportConfirmStep,
} from '@/features/vpn/ui/components';
import { ImportDesignerScreen } from '@/features/vpn/ui/screens/ImportDesignerScreen';
import { getServerCategory } from '@/features/vpn/ui/utils';
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
    setStep,
    setRawInput,
    setSelectedId,
    handleParse: hookHandleParse,
    handleBack: hookHandleBack,
  } = useImportConfig();

  // Load categories on mount
  useEffect(() => {
    if (!categorias?.length) {
      // `loadCategorias` is synchronous in domain layer; wrap to preserve async error handling
      error.handleAsyncError(async () => loadCategorias(), ErrorCategory.Internal);
    }
  }, [categorias?.length, loadCategorias, error]);

  // Compile all servers from categories (memoized)
  const allServers = useMemo(
    () =>
      categorias?.reduce((acc: ServerConfig[], cat) => {
        if (cat.items) acc.push(...cat.items);
        return acc;
      }, [] as ServerConfig[]) ?? [],
    [categorias],
  );

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

  // Handle opening designer
  const handleOpenDesigner = useCallback(() => {
    // if keyboard is open we want to dismiss it otherwise the footer
    // may stay hidden behind the virtual keyboard and taps will be
    // swallowed by the input element / keyboard overlay.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    hookHandleBack(); // Reset to input step but with designer visible
    setStep('designer');
  }, [setStep, hookHandleBack]);

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
      showToast(t('error.configApplyFailed'), document.activeElement as HTMLElement, 'error');
    }
  }, [matches, selectedId, parsed, setCreds, setConfig, showToast, setScreen, t, error]);

  const handleExport = useCallback(async () => {
    try {
      const sel = matches.find((m) => String(m.id) === String(selectedId)) || matches[0];
      if (!sel) {
        showToast(t('import.noServerFound'), document.activeElement as HTMLElement);
        return;
      }

      const exportJson = {
        server: {
          id: sel.id,
          name: sel.name,
          category: getServerCategory(sel, categorias) || '',
        },
        credentials: {
          username: parsed?.username || '',
          password: parsed?.password || '',
          uuid: parsed?.uuid || '',
        },
      };

      const text = JSON.stringify(exportJson, null, 2);
      await navigator.clipboard.writeText(text);
      showToast(t('import.copiedJson'), document.activeElement as HTMLElement);
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      showToast(t('error.copyFailed'), document.activeElement as HTMLElement, 'error');
    }
  }, [matches, selectedId, parsed, categorias, showToast, t]);

  // If in designer mode, show designer screen instead of normal flow
  if (step === 'designer') {
    return (
      <ImportDesignerScreen
        categorias={categorias}
        onJsonGenerated={(json) => {
          setRawInput(json);
          setStep('input');
        }}
        onCancel={() => {
          setStep('input');
        }}
      />
    );
  }

  // Styles
  const sectionStyle = {
    ['--nav-safe' as any]: `${navigationBarHeight}px`,
    ['--status-safe' as any]: `${statusBarHeight}px`,
  } as const;

  const stepLabels = [t('import.steps.input'), t('import.steps.select'), t('import.steps.confirm')];
  const stepKeys = ['input', 'select', 'confirm'] as const;
  const currentStepIndex = Math.max(0, stepKeys.indexOf(step as (typeof stepKeys)[number]));

  return (
    <section className="screen import-screen" style={sectionStyle}>
      {/* Step indicator */}
      <div className="import-dots">
        {stepLabels.map((label, i) => (
          <div
            key={i}
            className={`dot-item ${i === currentStepIndex ? 'active' : i < currentStepIndex ? 'done' : ''}`}
          >
            <span className="dot" />
            <span className="dot-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="import-main">
        <ErrorDisplay
          error={error.error}
          category={error.category}
          userMessage={error.userMessage}
          isRetryable={error.isRetryable}
          timestamp={error.timestamp}
          onDismiss={error.clearError}
        />

        {step === 'input' && (
          <ImportInputStep
            rawInput={rawInput}
            parseError={parseError}
            onInputChange={setRawInput}
          />
        )}

        {step === 'select' && matches.length > 1 && (
          <ImportSelectStep
            matches={matches}
            selectedId={selectedId}
            categorias={categorias}
            onSelectServer={setSelectedId}
            onBack={handleBack}
            onContinue={() => setStep('confirm')}
          />
        )}

        {step === 'confirm' && (
          <ImportConfirmStep
            matches={matches}
            selectedId={selectedId}
            parsed={parsed}
            categorias={categorias}
            onBack={handleBack}
            onApply={handleApply}
            onExport={handleExport}
          />
        )}
      </div>

      {/* Fixed footer for input step */}
      {step === 'input' && (
        <ImportInputFooter
          rawInput={rawInput}
          onContinue={handleParse}
          onOpenDesigner={handleOpenDesigner}
        />
      )}
    </section>
  );
});
