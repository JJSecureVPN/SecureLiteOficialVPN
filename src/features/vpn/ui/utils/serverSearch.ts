/**
 * Server search and matching utilities for import config
 * Handles normalized string comparison and multi-criteria matching
 */

import type { ServerConfig, Category } from '@/core/types';
import type { ParsedConfig } from './configParsing';

/**
 * Normalize string for comparison
 * - Convert to uppercase
 * - Remove accents (NFD normalization)
 * - Remove special characters
 * - Collapse whitespace
 */
export function normalizeString(value?: string | null): string {
  return (value || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search for servers matching parsed config
 * Uses multiple criteria: ID, name, host, category
 * Returns deduplicated and ranked results
 */
export function searchServers(
  parsed: ParsedConfig,
  allServers: ServerConfig[],
  categorias: Category[],
): ServerConfig[] {
  const found: ServerConfig[] = [];

  // Search by ID
  if (parsed.serverId !== undefined && parsed.serverId !== null) {
    const byId = allServers.filter((s) => String(s.id) === String(parsed.serverId));
    found.push(...byId);
  }

  // Search by name - exact, contains, or token-based
  if (parsed.serverName) {
    const normName = normalizeString(parsed.serverName);
    const byNameExact = allServers.filter((s) => normalizeString(s.name) === normName);

    if (byNameExact.length) {
      found.push(...byNameExact);
    } else {
      const byNameContains = allServers.filter((s) => normalizeString(s.name).includes(normName));
      if (byNameContains.length) {
        found.push(...byNameContains);
      } else {
        const tokens = normName.split(' ').filter(Boolean).slice(0, 5);
        const scored = allServers
          .map((s) => {
            const sname = normalizeString(s.name);
            let score = 0;
            for (const t of tokens) {
              if (sname.includes(t)) score += 1;
            }
            return { s, score };
          })
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        if (scored.length) {
          found.push(...scored.map((r) => r.s));
        }
      }
    }
  }

  // Search by host/IP
  if (parsed.serverHost) {
    const byHost = allServers.filter((s) =>
      normalizeString((s.description || '') + ' ' + (s.ip || '')).includes(
        normalizeString(parsed.serverHost),
      ),
    );
    if (byHost.length) found.push(...byHost);
  }

  // Deduplicate by ID
  const uniq = Array.from(new Map(found.map((s) => [String(s.id), s])).values());
  let finalMatches = uniq.slice();

  // Filter by category if specified
  if (uniq.length > 1 && parsed.serverCategory) {
    const byCategory = uniq.filter((s) => {
      const cat = categorias.find((c) => c.items?.some((i) => String(i.id) === String(s.id)));
      if (!cat) return false;
      const catName = normalizeString(cat.name);
      return catName.includes(normalizeString(parsed.serverCategory));
    });

    if (byCategory.length) finalMatches = byCategory;
  }

  return finalMatches;
}

/**
 * Get category name for a server
 */
export function getServerCategory(server: ServerConfig, categorias: Category[]): string | null {
  const cat = categorias.find((c) => c.items?.some((i) => String(i.id) === String(server.id)));
  return cat?.name || null;
}
