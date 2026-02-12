import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MiniHeader } from '../MiniHeader';

describe('MiniHeader', () => {
  it('renders title and back button and calls onBack when clicked', () => {
    const onBack = vi.fn();
    render(<MiniHeader title="Mi título" onBack={onBack} />);

    expect(screen.getByText('Mi título')).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /volver/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(onBack).toHaveBeenCalled();
  });

  it('does not render back button when showBackButton is false', () => {
    render(<MiniHeader title="No volver" showBackButton={false} />);
    expect(screen.queryByRole('button', { name: /volver/i })).toBeNull();
  });

  it('applies CSS custom properties as inline style', () => {
    render(<MiniHeader title="Style test" />);
    const header = document.querySelector('.mini-header') as HTMLElement | null;
    expect(header).toBeTruthy();
    if (header) {
      // JSDOM doesn't compute CSS variables, but inline style should expose the property
      const top = header.style.getPropertyValue('--mini-header-top');
      const buttonTop = header.style.getPropertyValue('--mini-header-button-top');
      expect(top).toBeTruthy();
      expect(buttonTop).toBeTruthy();
    }
  });
});
