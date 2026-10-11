import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaidProgress } from '../../src/components/ui/PaidProgress';
import { Odometer } from '../../src/components/ui/Odometer';
import { getPaidProgress } from '../../src/types';
import { readBillsCache, writeBillsCache } from '../../src/lib/billsCache';
import { fillTemplate } from '../../src/lib/utils';
import type { Player } from '../../src/types';

const player = (overrides: Partial<Player>): Player => ({
  name: 'A',
  participated: true,
  startTime: '',
  endTime: '',
  consumables: [],
  isFullSession: true,
  ...overrides,
});

describe('getPaidProgress', () => {
  it('counts only participating players', () => {
    const result = getPaidProgress([
      player({ paid: true }),
      player({}),
      player({ participated: false, paid: true }),
    ]);
    expect(result).toEqual({ paid: 1, total: 2 });
  });
});

describe('PaidProgress', () => {
  it('exposes progress to assistive tech', () => {
    render(<PaidProgress paid={2} total={5} label="2 of 5 paid" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
    expect(screen.getByText('2 of 5 paid')).toBeInTheDocument();
  });

  it('renders nothing without participants', () => {
    const { container } = render(<PaidProgress paid={0} total={0} label="" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('billsCache', () => {
  it('round-trips the list with its etag', () => {
    writeBillsCache({ etag: '"abc"', bills: [] });
    expect(readBillsCache()).toEqual({ etag: '"abc"', bills: [] });
  });

  it('discards a cache written by another build', () => {
    localStorage.setItem(
      'chiabill:history:v1',
      JSON.stringify({ etag: '"abc"', bills: [], build: 'other' }),
    );
    expect(readBillsCache()).toBeNull();
  });
});

describe('fillTemplate', () => {
  it('replaces known placeholders only', () => {
    expect(fillTemplate('{paid}/{total} {x}', { paid: 1, total: 3 })).toBe('1/3 {x}');
  });
});

describe('Odometer', () => {
  it('keeps the real number readable for assistive tech', () => {
    render(<Odometer value="1,250k" />);
    expect(screen.getByText('1,250k')).toHaveClass('sr-only');
  });
});

describe('PaidProgress segments', () => {
  it('renders one segment per player, filled for each who has paid', () => {
    const { container } = render(<PaidProgress paid={2} total={5} label="2 of 5 paid" />);
    expect(container.querySelectorAll('.seg')).toHaveLength(5);
    expect(container.querySelectorAll('.seg[data-filled="true"]')).toHaveLength(2);
  });
});
