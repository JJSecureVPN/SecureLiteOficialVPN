import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ImportInputFooter } from './ImportInputStep';

describe('ImportInputFooter', () => {
  const noop = () => {};
  it('calls onOpenDesigner when advanced options button is clicked', () => {
    const openSpy = vi.fn();
    const { getByText } = render(
      <ImportInputFooter rawInput="" onContinue={noop} onOpenDesigner={openSpy} />,
    );

    fireEvent.click(getByText(/opciones avanzadas/i));
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('also responds to touch/pointer events', () => {
    const openSpy = vi.fn();
    const { getByText } = render(
      <ImportInputFooter rawInput="" onContinue={noop} onOpenDesigner={openSpy} />,
    );

    const btn = getByText(/opciones avanzadas/i);
    fireEvent.touchStart(btn);
    fireEvent.pointerDown(btn);

    expect(openSpy).toHaveBeenCalledTimes(2);
  });
});
