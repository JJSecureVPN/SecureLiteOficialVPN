import React, { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useServersKeyboard } from '../useServersKeyboard';

function TestHost() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  useServersKeyboard(contentRef, null as any);

  return (
    <div>
      <div className="servers-content" ref={contentRef}>
        <div className="category-card" tabIndex={0} role="button">
          <button className="category-card__main">Category 1</button>
        </div>
        <div className="category-card" tabIndex={0} role="button">
          <button className="category-card__main">Category 2</button>
        </div>
      </div>
    </div>
  );
}

describe('useServersKeyboard (categories)', () => {
  it('focuses first category on first ArrowDown when nothing is focused', () => {
    const { container } = render(<TestHost />);
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.category-card'));
    // patch jsdom so visibility checks succeed
    cards.forEach((c) => {
      (c as any).getClientRects = () => [{ left: 0, top: 0, width: 10, height: 10 }];
      try {
        Object.defineProperty(c, 'offsetParent', { get: () => document.body });
      } catch {}
    });

    // ensure nothing is focused initially
    expect(document.activeElement).toBe(document.body);

    // press ArrowDown — final result should be focus on the next category (second card)
    fireEvent.keyDown(window, { key: 'ArrowDown' });

    expect(document.activeElement).toBe(cards[1]);
  });
});