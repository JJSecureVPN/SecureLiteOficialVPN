import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import keyboardNavigationManager from '../keyboardNavigationManager';

describe('keyboardNavigationManager — category-card navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="servers-content">
        <div class="category-card" tabindex="0">Category A</div>
        <div class="category-card" tabindex="0">Category B</div>
        <div class="category-card" tabindex="0">Category C</div>
      </div>
    `;
  });

  afterEach(() => {
    keyboardNavigationManager.disable();
    document.body.innerHTML = '';
  });

  it('moves focus between category cards with ArrowDown / ArrowUp', () => {
    const root = document.querySelector('.servers-content') as HTMLElement;
    expect(root).toBeTruthy();

    // enable manager scoped to the servers-content root
    const ok = keyboardNavigationManager.enable('.servers-content', { includeFormControls: true });
    expect(ok).toBe(true);

    const cards = Array.from(root.querySelectorAll<HTMLElement>('.category-card'));
    expect(cards.length).toBe(3);

    // jsdom has no layout by default — patch getClientRects and offsetParent so manager visibility checks pass
    cards.forEach((c) => {
      (c as any).getClientRects = () => [{ left: 0, top: 0, width: 10, height: 10 }];
      try {
        Object.defineProperty(c, 'offsetParent', { get: () => document.body });
      } catch {
        /* ignore if not writable in this JS environment */
      }
    });

    // ensure manager's item selector would include category-card elements
    const selector = '[data-nav], button, [role="button"], a, [tabindex]:not([tabindex="-1"])';
    const items = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => {
      if (el.hasAttribute('disabled')) return false;
      try {
        return el.offsetParent !== null || el.getClientRects().length > 0;
      } catch {
        return true;
      }
    });
    expect(items.some((el) => el.classList.contains('category-card'))).toBe(true);

    // focus first card and press ArrowDown
    cards[0].focus();
    expect(document.activeElement).toBe(cards[0]);

    // invoke the internal key handler directly (jsdom/window listener may not dispatch to global handler)
    const onKey = (keyboardNavigationManager as any).__onKey as ((e: KeyboardEvent) => void) | undefined;
    expect(typeof onKey).toBe('function');

    onKey?.(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(document.activeElement).toBe(cards[1]);

    // press ArrowDown again → goes to 3rd
    onKey?.(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(document.activeElement).toBe(cards[2]);

    // ArrowUp → back to 2nd
    onKey?.(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(document.activeElement).toBe(cards[1]);
  });
});