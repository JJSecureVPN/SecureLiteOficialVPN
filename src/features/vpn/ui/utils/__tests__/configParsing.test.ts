/**
 * Tests for configParsing utility functions
 */

import { describe, it, expect } from 'vitest';
import { parseConfigJson } from '@/features/vpn/ui/utils/configParsing';

describe('parseConfigJson', () => {
  const validConfig = `{
    "name": "VPN Config",
    "server": {
      "id": 1,
      "name": "Server 1",
      "ip": "192.168.1.1"
    }
  }`;

  const configWithComments = `{
    "server": { // Server config
      "id": 1,
      "name": "Server 1"
    },
    "credentials": {
      "username": "user" // Username
    } /* config done */
  }`;

  const configWithTrailingCommas = `{
    "server": {
      "id": 1,
      "name": "Server 1",
    },
    "credentials": {
      "username": "user",
    },
  }`;

  it('should parse valid JSON', () => {
    const result = parseConfigJson(validConfig);
    expect(result).not.toBeNull();
    expect(result?.serverId).toBe(1);
    expect(result?.serverName).toBe('Server 1');
  });

  it('should parse JSON with single-line comments', () => {
    const result = parseConfigJson(configWithComments);
    expect(result).not.toBeNull();
    expect(result?.serverId).toBe(1);
  });

  it('should parse JSON with trailing commas', () => {
    const result = parseConfigJson(configWithTrailingCommas);
    expect(result).not.toBeNull();
    expect(result?.serverId).toBe(1);
  });

  it('should extract server.id as serverId', () => {
    const config = '{"server": {"id": 42}}';
    const result = parseConfigJson(config);
    expect(result?.serverId).toBe(42);
  });

  it('should extract server.name as serverName', () => {
    const config = '{"server": {"name": "TestServer"}}';
    const result = parseConfigJson(config);
    expect(result?.serverName).toBe('TestServer');
  });

  it('should extract credentials.username as username', () => {
    const config = '{"credentials": {"username": "testuser"}}';
    const result = parseConfigJson(config);
    expect(result?.username).toBe('testuser');
  });

  it('should extract credentials.password as password', () => {
    const config = '{"credentials": {"password": "secret123"}}';
    const result = parseConfigJson(config);
    expect(result?.password).toBe('secret123');
  });

  it('should ignore top-level autoConnect property (manual connect only)', () => {
    const config = `{
      "autoConnect": true,
      "server": { "id": 7, "name": "ManualServer" },
      "credentials": { "username": "importuser", "password": "importpass" }
    }`;

    const result = parseConfigJson(config);
    expect(result).not.toBeNull();
    expect(result?.serverId).toBe(7);
    expect(result?.serverName).toBe('ManualServer');
    expect(result?.username).toBe('importuser');
    // ensure `autoConnect` is not surfaced in the parsed result
    expect((result as any).autoConnect).toBeUndefined();
  });

  it('should return null for invalid JSON', () => {
    const invalid = '{ invalid json }';
    const result = parseConfigJson(invalid);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = parseConfigJson('');
    expect(result).toBeNull();
  });

  it('should return null for whitespace only', () => {
    const result = parseConfigJson('   \n\n  ');
    expect(result).toBeNull();
  });

  it('should handle nested structures', () => {
    const nested = `{
      "server": {
        "id": 1,
        "info": {
          "ip": "1.1.1.1"
        }
      }
    }`;
    const result = parseConfigJson(nested);
    expect(result).not.toBeNull();
  });

  it('should preserve data types', () => {
    const config = `{
      "server": {
        "id": 42,
        "name": "Test"
      }
    }`;
    const result = parseConfigJson(config);
    expect(typeof result?.serverId).toMatch(/number|string/);
  });

  it('should handle special characters in strings', () => {
    const config = `{
      "server": {
        "name": "Server @ Location"
      }
    }`;
    const result = parseConfigJson(config);
    expect(result?.serverName).toBe('Server @ Location');
  });

  it('should handle unicode characters', () => {
    const config = `{
      "server": {
        "name": "São Paulo"
      }
    }`;
    const result = parseConfigJson(config);
    expect(result?.serverName).toBe('São Paulo');
  });
});
