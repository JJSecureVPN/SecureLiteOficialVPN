/**
 * useImportConfig Hook
 * Manages import configuration state and logic across 3 steps
 */

import { useState, useCallback } from 'react';
import type { ServerConfig, Category } from '@/core/types';
import { parseConfigJson, type ParsedConfig } from '../utils/configParsing';
import { searchServers } from '../utils/serverSearch';

export type ImportStep = 'input' | 'select' | 'confirm';

export interface UseImportConfigReturn {
  // State
  step: ImportStep;
  rawInput: string;
  parsed: ParsedConfig | null;
  matches: ServerConfig[];
  selectedId: string | number | null;
  parseError: string | null;

  // Setters
  setStep: (step: ImportStep) => void;
  setRawInput: (input: string) => void;
  setSelectedId: (id: string | number | null) => void;

  // Actions
  handleParse: (categorias: Category[], allServers: ServerConfig[]) => void;
  handleBack: () => void;
  handleReset: () => void;
}

export function useImportConfig(): UseImportConfigReturn {
  const [step, setStep] = useState<ImportStep>('input');
  const [rawInput, setRawInput] = useState('');
  const [parsed, setParsed] = useState<ParsedConfig | null>(null);
  const [matches, setMatches] = useState<ServerConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleParse = useCallback(
    (categorias: Category[], allServers: ServerConfig[]) => {
      setParseError(null);

      if (!rawInput.trim()) {
        setParseError('Input is empty');
        return;
      }

      const parsed = parseConfigJson(rawInput);
      if (!parsed) {
        setParseError('Invalid JSON format');
        return;
      }

      const foundServers = searchServers(parsed, allServers, categorias);
      if (foundServers.length === 0) {
        setParseError('No matching servers found');
        return;
      }

      setParsed(parsed);
      setMatches(foundServers);
      setSelectedId(foundServers[0].id);

      // Auto-advance step
      if (foundServers.length === 1) {
        setStep('confirm');
      } else {
        setStep('select');
      }
    },
    [rawInput],
  );

  const handleBack = useCallback(() => {
    if (step === 'select' || step === 'confirm') {
      setStep('input');
      setParseError(null);
    } else {
      // Handled by parent component
    }
  }, [step]);

  const handleReset = useCallback(() => {
    setStep('input');
    setRawInput('');
    setParsed(null);
    setMatches([]);
    setSelectedId(null);
    setParseError(null);
  }, []);

  return {
    step,
    rawInput,
    parsed,
    matches,
    selectedId,
    parseError,
    setStep,
    setRawInput,
    setSelectedId,
    handleParse,
    handleBack,
    handleReset,
  };
}
