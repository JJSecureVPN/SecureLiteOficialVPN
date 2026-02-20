import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNavigationState } from './useNavigationState';

function TestCmp({ termsAccepted }: { termsAccepted: boolean }) {
  const { screen: s } = useNavigationState(termsAccepted);
  return <div data-testid="screen">{s}</div>;
}

describe('useNavigationState (terms redirect)', () => {
  it('forces terms screen when NOT accepted on mobile-portrait', async () => {
    window.innerWidth = 375;
    window.innerHeight = 812;

    render(<TestCmp termsAccepted={false} />);

    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('terms'));
  });

  it('does NOT force terms on landscape/desktop', async () => {
    window.innerWidth = 1280;
    window.innerHeight = 720;

    render(<TestCmp termsAccepted={false} />);

    // should remain at default 'home'
    expect(screen.getByTestId('screen').textContent).toBe('home');
  });

  it('does NOT force terms when already accepted', async () => {
    window.innerWidth = 375;
    window.innerHeight = 812;

    render(<TestCmp termsAccepted={true} />);

    expect(screen.getByTestId('screen').textContent).toBe('home');
  });
});
