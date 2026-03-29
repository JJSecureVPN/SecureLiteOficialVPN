import { ref, computed } from "vue";
import { safeStorageGet, safeStorageSet } from "../../composables/useStorage";
import { normalizeText, isV2RayMode } from "../../utils/helpers";
import { hasBridge, sdk } from "../bridge/sdk";
import { STORAGE_KEYS } from "../../constants/storage-keys";


const username = ref("");
const password = ref("");
const uuid = ref("");

const usernameGroupHidden = ref(false);
const passwordGroupHidden = ref(false);
const uuidGroupHidden = ref(false);

const syncCredentialLock = (locked) => {
  // This should be called from components to disable inputs.
  // We'll keep the refs but actual DOM disabling happens in the template.
  // This helper is here for completeness.
  return locked;
};

export const loadCredentialFields = () => {
  const bridgeUsername = hasBridge("DtUsername")
    ? sdk.config.getUsername()
    : null;
  const bridgePassword = hasBridge("DtPassword")
    ? sdk.config.getPassword()
    : null;
  const bridgeUuid = hasBridge("DtUuid") ? sdk.config.getUuid() : null;

  username.value =
    bridgeUsername !== null && bridgeUsername !== undefined
      ? normalizeText(bridgeUsername)
      : normalizeText(safeStorageGet(STORAGE_KEYS.username));
  password.value =
    bridgePassword !== null && bridgePassword !== undefined
      ? normalizeText(bridgePassword)
      : normalizeText(safeStorageGet(STORAGE_KEYS.password));
  uuid.value =
    bridgeUuid !== null && bridgeUuid !== undefined
      ? normalizeText(bridgeUuid)
      : normalizeText(safeStorageGet(STORAGE_KEYS.uuid));
};

export const persistCredentialFields = () => {
  safeStorageSet(STORAGE_KEYS.username, normalizeText(username.value));
  safeStorageSet(STORAGE_KEYS.password, normalizeText(password.value));
  safeStorageSet(STORAGE_KEYS.uuid, normalizeText(uuid.value));
};

export const syncCredentialFieldsToBridge = () => {
  if (!sdk) return;
  const useUuid = isV2RayMode(serverMode.value);
  const normalizedUsername = normalizeText(username.value);
  const normalizedPassword = normalizeText(password.value);
  const normalizedUuid = normalizeText(uuid.value);

  if (!useUuid && hasBridge("DtUsername")) {
    sdk.config.setUsername(normalizedUsername);
  }
  if (!useUuid && hasBridge("DtPassword")) {
    sdk.config.setPassword(normalizedPassword);
  }
  if (hasBridge("DtUuid")) {
    sdk.config.setUuid(normalizedUuid);
  }
};

export const syncCredentialVisibility = () => {
  const useUuid = isV2RayMode(serverMode.value);
  usernameGroupHidden.value = useUuid;
  passwordGroupHidden.value = useUuid;
  uuidGroupHidden.value = !useUuid;
};

export const serverMode = ref("");

export const setServerMode = (mode) => {
  serverMode.value = mode;
  syncCredentialVisibility();
};

export const validateCredentials = () => {
  if (isV2RayMode(serverMode.value)) {
    return !!normalizeText(uuid.value);
  }
  return !!(
    normalizeText(username.value) && normalizeText(password.value)
  );
};

export const getCredentialErrorMessage = () =>
  isV2RayMode(serverMode.value)
    ? "Llene el UUID"
    : "Llene usuario y contraseña";

export const useCredentials = () => ({
  username,
  password,
  uuid,
  usernameGroupHidden,
  passwordGroupHidden,
  uuidGroupHidden,
  loadCredentialFields,
  persistCredentialFields,
  syncCredentialFieldsToBridge,
  syncCredentialVisibility,
  validateCredentials,
  getCredentialErrorMessage,
  setServerMode,
});
