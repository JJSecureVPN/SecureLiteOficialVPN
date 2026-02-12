import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewsButton } from '../NewsButton';

describe('NewsButton', () => {
  it('renders without unread', () => {
    const onClick = vi.fn();
    render(<NewsButton hasUnread={false} onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Noticias');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders attention when unread and triggers click', () => {
    const onClick = vi.fn();
    render(<NewsButton hasUnread={true} onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', expect.stringContaining('nuevas'));

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
