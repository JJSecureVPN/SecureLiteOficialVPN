import { memo } from 'react';
import { Input } from './Input';
import { UI_MESSAGES } from '../../constants';

interface CredentialFieldsProps {
  username: string;
  password: string;
  uuid: string;
  showUuid: boolean;
  showUserPass: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUuidChange: (value: string) => void;
}

/**
 * Campos de credenciales para autenticación VPN
 */
export const CredentialFields = memo(function CredentialFields({
  username,
  password,
  uuid,
  showUuid,
  showUserPass,
  onUsernameChange,
  onPasswordChange,
  onUuidChange,
}: CredentialFieldsProps) {
  if (!showUserPass && !showUuid) return null;

  return (
    <div className="fields">
      {showUserPass && (
        <>
          <Input
            icon="user"
            placeholder={UI_MESSAGES.credentials.usernamePlaceholder}
            value={username}
            onChange={onUsernameChange}
          />
          <Input
            icon="lock"
            placeholder={UI_MESSAGES.credentials.passwordPlaceholder}
            value={password}
            onChange={onPasswordChange}
            toggleVisibility
          />
        </>
      )}
      {showUuid && (
        <Input
          icon="key"
          placeholder={UI_MESSAGES.credentials.uuidPlaceholder}
          value={uuid}
          onChange={onUuidChange}
          className={showUserPass ? '' : 'full'}
        />
      )}
    </div>
  );
});
