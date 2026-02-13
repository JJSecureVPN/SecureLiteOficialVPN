import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../../i18n/context';
import { ThemeButton } from '../ThemeButton';

describe('ThemeButton', () => {
  it('renders moon for light theme and toggles', () => {
    const onToggle = vi.fn();
    render(
      <LanguageProvider>
        <ThemeButton theme="light" onToggle={onToggle} />
      </LanguageProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Cambiar a modo oscuro');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalled();
  });

  it('renders sun for dark theme', () => {
    render(
      <LanguageProvider>
        <ThemeButton theme="dark" onToggle={() => {}} />
      </LanguageProvider>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Cambiar a modo claro');
  });
});
