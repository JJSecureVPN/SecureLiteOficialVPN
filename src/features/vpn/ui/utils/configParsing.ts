/**
 * Parsing utilities for import config feature
 * Handles JSON parsing with comment/trailing comma stripping
 */

export interface ParsedConfig {
  serverId?: string | number;
  serverName?: string;
  serverHost?: string;
  serverCategory?: string;
  username?: string;
  password?: string;
  uuid?: string;
}

/**
 * Strip comments and trailing commas from JSON string
 * Allows // single line and /* multi-line comments
 */
function stripCommentsAndTrailingCommas(input: string): string {
  let i = 0;
  let out = '';
  let inString = false;
  let stringChar = '';

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (!inString) {
      if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
        out += ch;
        i++;
        continue;
      }

      // // single-line comment
      if (ch === '/' && next === '/') {
        i += 2;
        while (i < input.length && input[i] !== '\n') i++;
        continue;
      }

      // /* multi-line comment */
      if (ch === '/' && next === '*') {
        i += 2;
        while (i < input.length && !(input[i] === '*' && input[i + 1] === '/')) i++;
        i += 2;
        continue;
      }

      out += ch;
      i++;
    } else {
      out += ch;
      if (ch === '\\') {
        if (i + 1 < input.length) {
          out += input[i + 1];
          i += 2;
        } else {
          i++;
        }
        continue;
      }

      if (ch === stringChar) {
        inString = false;
        stringChar = '';
      }
      i++;
    }
  }

  // Remove trailing commas
  out = out.replace(/,\s*(?=[}\]])/g, '');
  return out;
}

/**
 * Parse JSON config text with lenient error handling
 */
export function parseConfigJson(text: string): ParsedConfig | null {
  if (!text.trim()) return null;

  try {
    const sanitized = stripCommentsAndTrailingCommas(text);
    const obj = JSON.parse(sanitized);

    const out: ParsedConfig = {};

    // Extract server info
    if (obj.server) {
      out.serverId = obj.server.id || obj.serverId || obj.id;
      out.serverName = obj.server.name || obj.serverName;
      out.serverHost = obj.server.host || obj.serverHost;
      out.serverCategory = obj.server.category || obj.server.location || obj.server.country;
    } else {
      out.serverId = obj.serverId || obj.id;
      out.serverName = obj.serverName || obj.server || obj.name;
      out.serverHost = obj.serverHost || obj.host;
      out.serverCategory = obj.category || obj.country || obj.location;
    }

    // Extract credentials
    if (obj.credentials) {
      out.username = obj.credentials.username || obj.credentials.user;
      out.password = obj.credentials.password || obj.credentials.pass;
      out.uuid = obj.credentials.uuid;
    } else {
      out.username = obj.username || obj.user;
      out.password = obj.password || obj.pass;
      out.uuid = obj.uuid;
    }

    return out;
  } catch {
    return null;
  }
}
