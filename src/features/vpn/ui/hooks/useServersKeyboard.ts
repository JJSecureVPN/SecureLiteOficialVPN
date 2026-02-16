/**
 * useServersKeyboard Hook
 * Manages all keyboard navigation for servers screen
 * - Auto-enable navigation manager on first key press
 * - Navigate between category cards (arrow up/down/left)
 * - Navigate within server grid (arrow keys with intelligent grid detection)
 * - Focus search input on Enter
 */

import { useEffect, useRef } from 'react';
import { keyboardNavigationManager } from '@/core/utils';

interface GridPosition {
  row: number;
  col: number;
}

interface GridNode {
  el: HTMLElement;
  rect: DOMRect;
  c: { x: number; y: number };
  i: number;
}

interface Grid {
  grid: GridNode[][];
  indexMap: Map<number, GridPosition>;
}

/**
 * Helper: Calculate center point of DOM rect
 */
function getCenter(r: DOMRect) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Helper: Build grid layout from elements
 * Groups items into rows based on proximity, then sorts each row by X position
 */
function buildGrid(items: HTMLElement[]): Grid {
  const nodes = items.map((el, i) => {
    const rect = el.getBoundingClientRect();
    const c = getCenter(rect);
    return { el, rect, c, i };
  });

  // Sort by Y then X to establish row order
  nodes.sort((a, b) => a.c.y - b.c.y || a.c.x - b.c.x);

  // Group into rows based on Y proximity
  const rows: GridNode[][] = [];
  for (const node of nodes) {
    const last = rows[rows.length - 1];
    if (!last) {
      rows.push([node]);
      continue;
    }

    const avgHeight = last.reduce((s, n) => s + n.rect.height, 0) / last.length || node.rect.height;
    const tolerance = Math.max(12, avgHeight * 0.5);
    const lastY = last.reduce((s, n) => s + n.c.y, 0) / last.length;

    if (Math.abs(node.c.y - lastY) <= tolerance) {
      last.push(node);
    } else {
      rows.push([node]);
    }
  }

  // Sort each row by X position
  const grid = rows.map((r) => r.sort((a, b) => a.c.x - b.c.x));

  // Create index map for quick lookup
  const indexMap = new Map<number, GridPosition>();
  grid.forEach((row, ri) => row.forEach((n, ci) => indexMap.set(n.i, { row: ri, col: ci })));

  return { grid, indexMap };
}

/**
 * Helper: Find nearest column in a row by X coordinate
 */
function findNearestInRowByX(row: GridNode[], x: number) {
  let best = 0;
  let bestDist = Infinity;
  row.forEach((n, i) => {
    const d = Math.abs(n.c.x - x);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export function useServersKeyboard(
  contentRef: React.RefObject<HTMLDivElement | null>,
  selectedCategory: any,
  onEnterOnCategory?: (input: HTMLInputElement) => void,
) {
  const keyboardEnabledRef = useRef(false);

  // Auto-enable navigation manager on first key press
  useEffect(() => {
    const onFirstKey = (e: KeyboardEvent) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', ' '];
      if (!keys.includes(e.key)) return;

      if (!keyboardNavigationManager.enabled) {
        keyboardNavigationManager.enable('.servers-content', { includeFormControls: true });
        keyboardEnabledRef.current = true;

        // If nothing is focused, move focus to the first navigable item so the initial arrow key has effect
        try {
          const root = document.querySelector('.servers-content') as HTMLElement | null;
          if (root && (document.activeElement === document.body || !root.contains(document.activeElement))) {
            const selector = '[data-nav], button, [role="button"], a, [tabindex]:not([tabindex="-1"])';
            const items = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => {
              if (el.hasAttribute('disabled')) return false;
              try {
                return el.offsetParent !== null || el.getClientRects().length > 0;
              } catch {
                return true;
              }
            });
            if (items.length) {
              items[0].focus();
            }
          }
        } catch {
          /* ignore focus errors */
        }
      }
    };

    window.addEventListener('keydown', onFirstKey);
    return () => window.removeEventListener('keydown', onFirstKey);
  }, []);

  // Focus search input when pressing Enter while viewing categories
  useEffect(() => {
    if (selectedCategory) return;

    const root = contentRef.current;
    if (!root) return;

    const onEnterWithExitable = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;

      const input = root.querySelector<HTMLInputElement>('.search-field input[data-nav]');
      if (!input) return;

      input.focus();
      input.setAttribute('data-exitable', '1');

      const onBlur = () => {
        input.removeAttribute('data-exitable');
        input.removeEventListener('blur', onBlur);
      };

      input.addEventListener('blur', onBlur);
      onEnterOnCategory?.(input);
    };

    window.addEventListener('keydown', onEnterWithExitable);
    return () => window.removeEventListener('keydown', onEnterWithExitable);
  }, [selectedCategory, onEnterOnCategory]);

  // Navigate between category cards when viewing categories list
  useEffect(() => {
    if (selectedCategory) return;

    const root = contentRef.current;
    if (!root) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return;

      const active = document.activeElement as HTMLElement | null;
      if (!active) return;

      // Find ancestor category-card element
      let node: HTMLElement | null = active;
      while (node && !node.classList?.contains('category-card')) {
        node = node.parentElement as HTMLElement | null;
      }
      if (!node) return;

      const cards = Array.from(root.querySelectorAll<HTMLElement>('.category-card')).filter(
        (el) => el.offsetParent !== null && !el.hasAttribute('disabled'),
      );

      if (!cards.length) return;

      const idx = cards.indexOf(node);
      if (idx === -1) return;

      if (e.key === 'ArrowDown') {
        const next = cards[Math.min(cards.length - 1, idx + 1)];
        if (next && next !== node) {
          next.focus();
          e.preventDefault();
        }
      } else if (e.key === 'ArrowUp') {
        const prev = cards[Math.max(0, idx - 1)];
        if (prev && prev !== node) {
          prev.focus();
          e.preventDefault();
        }
      } else if (e.key === 'ArrowLeft') {
        // Focus back button in header
        const selectors = [
          'header.topbar [data-nav]',
          'header.topbar button.btn.hotzone',
          'header.topbar .btn.hotzone',
          'header.topbar .hotzone',
        ];

        const back = document.querySelector<HTMLElement>(selectors.join(','));
        if (back) {
          try {
            back.setAttribute('tabindex', '0');
            back.setAttribute('data-nav', '1');
          } catch {}

          setTimeout(() => {
            try {
              back.focus();
            } catch {}
          }, 0);

          e.preventDefault();
        }
      }
    };

    root.addEventListener('keydown', onKey);
    window.addEventListener('keydown', onKey);

    return () => {
      root.removeEventListener('keydown', onKey);
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedCategory]);

  // Grid navigation within server items
  useEffect(() => {
    if (!selectedCategory) return;

    const root = contentRef.current;
    if (!root) return;

    const selector = '.server-grid .server-item';

    const getItems = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          (el.offsetParent !== null || el.getClientRects().length > 0),
      );

    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;

      const items = getItems();
      if (!items.length) return;

      const active = document.activeElement as HTMLElement | null;
      const activeIdx = active ? items.indexOf(active) : -1;

      const { grid, indexMap } = buildGrid(items);

      if (activeIdx < 0) {
        const first = grid[0]?.[0]?.el;
        if (first) {
          first.focus();
          e.preventDefault();
        }
        return;
      }

      const pos = indexMap.get(activeIdx);
      if (!pos) return;

      const { row: r, col: c } = pos;
      let target: GridPosition | null = null;

      if (e.key === 'ArrowDown') {
        const nextRow = Math.min(grid.length - 1, r + 1);
        if (nextRow !== r) {
          const desiredX = grid[r][c].c.x;
          const colInNext = findNearestInRowByX(grid[nextRow], desiredX);
          target = { row: nextRow, col: colInNext };
        }
      } else if (e.key === 'ArrowUp') {
        const prevRow = Math.max(0, r - 1);
        if (prevRow !== r) {
          const desiredX = grid[r][c].c.x;
          const colInPrev = findNearestInRowByX(grid[prevRow], desiredX);
          target = { row: prevRow, col: colInPrev };
        }
      } else if (e.key === 'ArrowLeft') {
        // Focus back to header
        const selectors = [
          'header.topbar [data-nav]',
          'header.topbar button.btn.hotzone',
          'header.topbar .btn.hotzone',
          'header.topbar .hotzone',
        ];

        const back = document.querySelector<HTMLElement>(selectors.join(','));
        if (back) {
          try {
            back.setAttribute('tabindex', '0');
            back.setAttribute('data-nav', '1');
          } catch {}

          setTimeout(() => {
            try {
              back.focus();
            } catch {}
          }, 0);

          return;
        }
      }

      if (target) {
        const el = grid[target.row]?.[target.col]?.el;
        if (el) {
          el.focus();
          e.preventDefault();
        }
      }
    };

    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, [selectedCategory]);
}
