import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../i18n/context';
import { ServerCard } from '../ServerCard';

const makeConfig = (overrides = {}) => ({
  id: 1,
  name: 'Servidor 1',
  description: '127.0.0.1',
  icon: '🌐',
  ...overrides,
});

describe('ServerCard', () => {
  it('renders name and description and calls onClick', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <ServerCard config={makeConfig()} onClick={onClick} />
      </LanguageProvider>,
    );

    expect(screen.getByText('Servidor 1')).toBeInTheDocument();
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders image if icon is a URL', () => {
    const config = makeConfig({ icon: 'https://example.com/img.png' });
    render(
      <LanguageProvider>
        <ServerCard config={config} onClick={() => {}} />
      </LanguageProvider>,
    );
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img).toHaveAttribute('src', 'https://example.com/img.png');
  });

  it('falls back to emoji when image errors', () => {
    const onClick = vi.fn();
    const config = makeConfig({ icon: 'https://example.com/bad.png' });
    render(
      <LanguageProvider>
        <ServerCard config={config} onClick={onClick} />
      </LanguageProvider>,
    );

    const img = screen.getByRole('img') as HTMLImageElement;
    // Simulate image error
    fireEvent.error(img);

    expect(screen.getByText('🌐')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <ServerCard config={makeConfig()} onClick={onClick} disabled />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick with keyboard Enter/Space', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <ServerCard config={makeConfig()} onClick={onClick} />
      </LanguageProvider>,
    );

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
