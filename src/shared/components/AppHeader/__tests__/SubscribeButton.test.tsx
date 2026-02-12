import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscribeButton } from '../SubscribeButton';

describe('SubscribeButton', () => {
  it('renders and calls onClick', () => {
    const onClick = vi.fn();
    render(<SubscribeButton onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Suscribirse a un plan');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
