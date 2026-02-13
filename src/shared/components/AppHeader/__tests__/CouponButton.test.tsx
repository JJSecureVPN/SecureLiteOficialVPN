import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../../i18n/context';
import { CouponButton } from '../CouponButton';

const coupons = [
  {
    id: 1,
    codigo: 'A',
    tipo: '',
    valor: 0,
    limite_uso: 1,
    usos_actuales: 0,
    activo: true,
    oculto: false,
  },
  {
    id: 2,
    codigo: 'B',
    tipo: '',
    valor: 0,
    limite_uso: 1,
    usos_actuales: 0,
    activo: true,
    oculto: false,
  },
];

describe('CouponButton', () => {
  it('does not render when no coupons', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <CouponButton coupons={[]} onClick={onClick} />
      </LanguageProvider>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders badge and triggers click', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <CouponButton coupons={coupons as any} onClick={onClick} />
      </LanguageProvider>,
    );

    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', expect.stringContaining('2'));

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
