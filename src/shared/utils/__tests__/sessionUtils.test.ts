import { describe, it, expect } from 'vitest';
import { getDisplayName } from '../sessionUtils';
import { UI_MESSAGES } from '../../../constants';

describe('getDisplayName', () => {
  it('uses user.name when available', () => {
    expect(getDisplayName({ name: 'Alice' } as any, undefined, undefined)).toBe('Alice');
  });

  it('falls back to config.auth.username', () => {
    expect(getDisplayName(undefined, { auth: { username: 'cfgUser' } } as any, undefined)).toBe(
      'cfgUser',
    );
  });

  it('falls back to creds.user', () => {
    expect(getDisplayName(undefined, undefined, { user: 'credsUser' } as any)).toBe('credsUser');
  });

  it('falls back to default UI_MESSAGES.account.defaultUser when nothing provided', () => {
    expect(getDisplayName(undefined, undefined, undefined)).toBe(UI_MESSAGES.account.defaultUser);
  });
});
