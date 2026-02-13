import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../../i18n/context';
import { NewsButton } from '../NewsButton';

describe('NewsButton', () => {
  it('renders without unread', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <NewsButton hasUnread={false} onClick={onClick} />
      </LanguageProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Noticias');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders attention when unread and triggers click', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <NewsButton hasUnread={true} onClick={onClick} />
      </LanguageProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', expect.stringContaining('sin leer'));

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
