import '@testing-library/jest-dom';
import { LS_KEYS } from '@/core/constants';

// Ensure tests default to Spanish locale unless overridden
localStorage.setItem(LS_KEYS.language, 'es');
