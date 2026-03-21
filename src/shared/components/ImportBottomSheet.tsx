import { memo, useCallback, useEffect, useMemo } from 'react';
import { useVpn } from '@/features/vpn';
import { useTranslation } from '@/i18n';
import { useToastContext } from '@/shared/context/ToastContext';
import { useImportConfig } from '@/features/vpn/ui/hooks';
import {
  ImportInputStep,
  ImportInputFooter,
  ImportSelectStep,
  ImportConfirmStep,
} from '@/features/vpn/ui/components';
import { ImportDesignerScreen } from '../../features/vpn/ui/screens/ImportDesignerScreen';
import { getServerCategory } from '@/features/vpn/ui/utils';
import { BottomSheet } from './BottomSheet';
import '../../styles/components/import-screen.css';
import '../../styles/components/import-designer-screen.css';

interface ImportBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ImportBottomSheet
 * Migrates the standalone ImportConfigScreen to a premium BottomSheet.
 * Includes multi-step import and the configuration designer.
 */
export const ImportBottomSheet = memo(function ImportBottomSheet({
  isOpen,
  onClose,
}: ImportBottomSheetProps) {
  const { categorias, loadCategorias, setConfig, setCreds } = useVpn();
  const { showToast } = useToastContext();
  const { t } = useTranslation();

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
  } = useImportConfig();

  // Load categories on mount
  useEffect(() => {
    if (isOpen && !categorias?.length) {
      loadCategorias();
    }
  }, [isOpen, categorias?.length, loadCategorias]);

  // Compile all servers from categories
  const allServers = useMemo(
    () =>
      categorias?.reduce((acc: any[], cat) => {
        if (cat.items) acc.push(...cat.items);
        return acc;
      }, []) ?? [],
    [categorias],
  );

  const handleParse = useCallback(() => {
    hookHandleParse(categorias, allServers);
  }, [categorias, allServers, hookHandleParse]);

  const handleApply = useCallback(() => {
    try {
      const sel = matches.find((m) => String(m.id) === String(selectedId)) || matches[0];
      if (!sel) {
        showToast(t('import.noServerFound'));
        return;
      }

      setCreds({
        user: parsed?.username || '',
        pass: parsed?.password || '',
        uuid: parsed?.uuid || '',
      });

      setConfig(sel);
      showToast(t('import.applied') || t('import.appliedFallback'));
      onClose(); // Cerrar el sheet tras aplicar
    } catch {
      showToast(t('error.configApplyFailed'), null, 'error');
    }
  }, [matches, selectedId, parsed, setCreds, setConfig, showToast, onClose, t]);

  const handleExport = useCallback(async () => {
    try {
      const sel = matches.find((m) => String(m.id) === String(selectedId)) || matches[0];
      if (!sel) return;

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

      await navigator.clipboard.writeText(JSON.stringify(exportJson, null, 2));
      showToast(t('import.copiedJson'));
    } catch {
      showToast(t('error.copyFailed'), null, 'error');
    }
  }, [matches, selectedId, parsed, categorias, showToast, t]);

  const handleOpenDesigner = useCallback(() => {
    setStep('designer');
  }, [setStep]);

  // Si estamos en modo diseñador, el contenido cambia radicalmente
  // Pero mantenemos el envoltorio de BottomSheet para consistencia.
  const isDesigner = step === 'designer';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isDesigner ? t('import.designJson') || 'Diseñar JSON' : t('import.title')}
      subtitle={isDesigner ? t('import.designJsonSubtitle') : t('import.subtitle')}
      icon={<i className={`fa ${isDesigner ? 'fa-pen-to-square' : 'fa-file-import'}`} />}
      className="import-bottom-sheet"
      height="auto"
    >
      <div className="import-content import-screen" style={{ padding: '0 4px' }}>
        {isDesigner ? (
          <ImportDesignerScreen
            categorias={categorias}
            onJsonGenerated={(json) => {
              setRawInput(json);
              setStep('input');
            }}
            onCancel={() => setStep('input')}
          />
        ) : (
          <>
            {/* Dots / Steps indicator can be simplified here or kept if space allowing */}
            <div
              className="import-steps-mini"
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '16px',
                opacity: 0.8,
              }}
            >
              {['input', 'select', 'confirm'].map((s) => (
                <div
                  key={s}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: step === s ? 'var(--accent)' : 'var(--border)',
                  }}
                />
              ))}
            </div>

            {step === 'input' && (
              <div className="import-step-wrapper">
                <ImportInputStep
                  rawInput={rawInput}
                  parseError={parseError}
                  onInputChange={setRawInput}
                />
                <div style={{ marginTop: '16px' }}>
                  <ImportInputFooter
                    rawInput={rawInput}
                    onContinue={handleParse}
                    onOpenDesigner={handleOpenDesigner}
                  />
                </div>
              </div>
            )}

            {step === 'select' && matches.length > 1 && (
              <ImportSelectStep
                matches={matches}
                selectedId={selectedId}
                categorias={categorias}
                onSelectServer={setSelectedId}
                onBack={() => setStep('input')}
                onContinue={() => setStep('confirm')}
              />
            )}

            {step === 'confirm' && (
              <ImportConfirmStep
                matches={matches}
                selectedId={selectedId}
                parsed={parsed}
                categorias={categorias}
                onBack={() => setStep(matches.length > 1 ? 'select' : 'input')}
                onApply={handleApply}
                onExport={handleExport}
              />
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
});
