import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ServerCategory } from '../ServerCategory';

const mockCategory = {
  name: 'TestCat',
  items: [{ id: 1, name: 'Srv 1' }, { id: 2, name: 'Srv 2' }],
};

describe('ServerCategory', () => {
  it('renders category card and is keyboard-navigable (data-nav on container)', () => {
    const onCategoryClick = () => undefined;
    const onToggleStats = () => undefined;

    render(
      <ServerCategory
        category={mockCategory as any}
        hasSelectedServer={false}
        autoMode={false}
        liveStats={null}
        isExpanded={false}
        onCategoryClick={onCategoryClick}
        onToggleStats={onToggleStats}
      />,
    );

    const card = screen.getByText('TestCat').closest('.category-card');
    expect(card).toBeTruthy();
    expect(card).toHaveAttribute('tabindex', '0');
    // we added data-nav to the container to make it consistently reachable by keyboard navigation
    expect(card).toHaveAttribute('data-nav');
  });
});