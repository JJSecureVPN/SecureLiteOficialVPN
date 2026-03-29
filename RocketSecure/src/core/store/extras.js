import { sdk, hasBridge } from "../bridge/sdk";
import { useModals } from "../../composables/useModals";
import { safeStorageSet } from "../../composables/useStorage";
import { useServers, clearSelectedServer } from "./servers";
import { useCredentials } from "./credentials";
import { setDisconnectedState } from "./vpn";
import { STORAGE_KEYS } from "../../constants/storage-keys";

export const handleUpdateAction = () => {
  if (!sdk || !hasBridge("DtStartAppUpdate")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Actualización no disponible";
    return;
  }
  sdk.main.startAppUpdate();
  const connectStatus = document.getElementById("connect-status");
  if (connectStatus) connectStatus.textContent = "Actualización iniciada";
};



export const handleBatteryAction = () => {
  if (!sdk || !hasBridge("DtIgnoreBatteryOptimizations")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Ajuste de batería no disponible";
    return;
  }
  sdk.app.ignoreBatteryOptimizations();
  const connectStatus = document.getElementById("connect-status");
  if (connectStatus) connectStatus.textContent = "Ajuste de batería solicitado";
};

export const handleApnAction = () => {
  if (!sdk || !hasBridge("DtStartApnActivity")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Editor de APN no disponible";
    return;
  }
  sdk.app.startApnActivity();
};

export const handleNetworkAction = () => {
  if (!sdk || !hasBridge("DtStartRadioInfoActivity")) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Configuración de red no disponible";
    return;
  }
  sdk.app.startRadioInfoActivity();
};

export const handleRoutingAction = () => {
  const { openModal } = useModals();
  openModal("hotspot");
};

export const executeCleanAppAction = () => {
  const canClean = sdk && hasBridge("DtCleanApp");
  const canClose = sdk && hasBridge("DtCloseApp");
  if (!canClean && !canClose) {
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Limpieza de la aplicación no disponible";
    return;
  }
  Object.values(STORAGE_KEYS).forEach((storageKey) => {
    safeStorageSet(storageKey, "");
  });

  // Reset in-memory state to match cleared storage.
  clearSelectedServer();
  useServers().setAutoServerMode(false);
  useServers().stopAutoServerTesting();
  setDisconnectedState();

  // Clear native bridge state (config + credentials) when possible
  if (hasBridge("DtSetConfig")) {
    try {
      sdk.config.setConfig(0);
    } catch (error) {
      // ignore - may not work on all versions
    }
  }
  if (hasBridge("DtUsername")) {
    try {
      sdk.config.setUsername("");
    } catch (error) {
      // ignore
    }
  }
  if (hasBridge("DtPassword")) {
    try {
      sdk.config.setPassword("");
    } catch (error) {
      // ignore
    }
  }
  if (hasBridge("DtUuid")) {
    try {
      sdk.config.setUuid("");
    } catch (error) {
      // ignore
    }
  }

  const { username, password, uuid } = useCredentials();
  username.value = "";
  password.value = "";
  uuid.value = "";

  const usernameField = document.getElementById("username-field");
  const passwordField = document.getElementById("password-field");
  const uuidField = document.getElementById("uuid-field");
  if (usernameField) usernameField.value = "";
  if (passwordField) passwordField.value = "";
  if (uuidField) uuidField.value = "";

  if (hasBridge("DtExecuteVpnStop")) {
    try {
      sdk.main.stopVpn();
    } catch (e) {
      // ignore
    }
  }

  window.setTimeout(() => {
    if (canClean) {
      sdk.app.cleanApp();
    }
    if (canClose) {
      sdk.android.closeApp();
      return;
    }
    const connectStatus = document.getElementById("connect-status");
    if (connectStatus) connectStatus.textContent = "Aplicación limpia";
  }, 180);
};

export const handleCleanAppAction = executeCleanAppAction;
