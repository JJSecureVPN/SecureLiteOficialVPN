import { describe, it, expect } from 'vitest';
import { extractDomain, removeDomainFromDescription } from '@/core/utils';

describe('formatUtils - domain extraction / description cleanup', () => {
  it('does not extract domain when description is exactly the token', () => {
    expect(extractDomain('Cloudflare')).toBeNull();
    expect(removeDomainFromDescription('Cloudflare')).toBe('Cloudflare');

    expect(extractDomain('Front A')).toBeNull();
    expect(removeDomainFromDescription('Front A')).toBe('Front A');
  });

  it('extracts domain when additional text exists and removes it from description', () => {
    expect(extractDomain('Cloudflare - low latency')).toBe('Cloudflare');
    expect(removeDomainFromDescription('Cloudflare - low latency')).toBe('low latency');

    expect(extractDomain('Front B • backup route')).toBe('Front B');
    expect(removeDomainFromDescription('Front B • backup route')).toBe('backup route');
  });

  it('handles domain inside parentheses and trims punctuation', () => {
    expect(extractDomain('Low latency (Cloudflare)')).toBe('Cloudflare');
    expect(removeDomainFromDescription('Low latency (Cloudflare)')).toBe('Low latency');
  });

  it('keeps full description when domain token is the only content after punctuation removal', () => {
    expect(extractDomain('- Cloudflare -')).toBeNull();
    expect(removeDomainFromDescription('- Cloudflare -')).toBe('Cloudflare');
  });
});