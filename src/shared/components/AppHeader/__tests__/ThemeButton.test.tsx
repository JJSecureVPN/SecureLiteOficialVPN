import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeButton } from '../ThemeButton';

describe('ThemeButton', () => {
  it('renders moon for light theme and toggles', () => {
    const onToggle = vi.fn();
    render(<ThemeButton theme="light" onToggle={onToggle} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Cambiar a modo oscuro');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalled();
  });

  it('renders sun for dark theme', () => {
    render(<ThemeButton theme="dark" onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Cambiar a modo claro');
  });
});
