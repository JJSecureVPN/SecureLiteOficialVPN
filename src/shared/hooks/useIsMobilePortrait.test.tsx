import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsMobilePortrait } from './useIsMobilePortrait';

function TestCmp() {
  const value = useIsMobilePortrait();
  return <div data-testid="value">{String(value)}</div>;
}

describe('useIsMobilePortrait', () => {
  it('returns true for narrow portrait and updates on resize', async () => {
    window.innerWidth = 375;
    window.innerHeight = 812;

    render(<TestCmp />);
    expect(screen.getByTestId('value').textContent).toBe('true');

    // switch to landscape
    window.innerWidth = 1280;
    window.innerHeight = 720;
    window.dispatchEvent(new Event('resize'));

    await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('false'));
  });

  it('returns false for wide screens', () => {
    window.innerWidth = 1024;
    window.innerHeight = 600;
    render(<TestCmp />);
    expect(screen.getByTestId('value').textContent).toBe('false');
  });
});
