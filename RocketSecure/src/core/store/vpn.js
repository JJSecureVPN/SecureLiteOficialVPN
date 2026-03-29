import { ref } from "vue";
import { sdk, hasBridge } from "../bridge/sdk";
import { applyFlameMode, animateRocketLaunch, mountRocketScene, observeRocketScale } from "../../composables/useRocketScene";
import { useServers } from "./servers";
import { useCredentials } from "./credentials";
import { useModals } from "../../composables/useModals";
import { normalizeText } from "../../utils/helpers";
import { setAutoAuthErrorText } from "./autoAuthError";

const { openModal } = useModals();

export const vpnState = ref("DISCONNECTED");
export const isConnected = ref(false);
export const isConnecting = ref(false);
export const connectStatus = ref("Desconectado • toca para conectar");
export const activeTime = ref("00:00:00");

let activeSeconds = 0;
let timerId = null;

export const connectPanelClass = ref("");

const startTimer = () => {
  clearInterval(timerId);
  timerId = setInterval(() => {
    activeSeconds += 1;
    activeTime.value = formatTime(activeSeconds);
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerId);
  timerId = null;
};

export const formatTime = (seconds) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
};

export const setDisconnectedState = () => {
  isConnected.value = false;
  isConnecting.value = false;
  connectPanelClass.value = "";
  connectStatus.value = "Desconectado • toca para conectar";
  activeSeconds = 0;
  activeTime.value = "00:00:00";
  stopTimer();
  const rocketHost = document.getElementById("rocket-host");
  if (rocketHost) {
    mountRocketScene(rocketHost).then((shadowRoot) => {
      if (shadowRoot) {
        observeRocketScale(rocketHost, shadowRoot);
        applyFlameMode(shadowRoot, "idle");
      }
    });
  }
};

const setConnectedState = () => {
  const wasConnected = isConnected.value;
  const wasConnecting = isConnecting.value;
  
  isConnected.value = true;
  isConnecting.value = false;
  connectPanelClass.value = "connected";
  connectStatus.value = "Conectado";
  startTimer();
  
  if (!wasConnected) {
    const rocketHost = document.getElementById("rocket-host");
    if (rocketHost) {
      if (wasConnecting) {
        animateRocketLaunch(rocketHost);
      } else if (rocketHost.shadowRoot) {
        applyFlameMode(rocketHost.shadowRoot, "idle");
      }
    }
  }
};

const normalizeVpnState = (value) => {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!raw) return "";
  if (raw === "CONNECTED") return "CONNECTED";
  if (raw === "DISCONNECTED") return "DISCONNECTED";
  if (raw === "CONNECTING") return "CONNECTING";
  if (raw === "STOPPING") return "STOPPING";
  if (raw === "AUTH") return "AUTH";
  if (raw === "AUTH_FAILED") return "AUTH_FAILED";
  if (raw === "NO_NETWORK") return "NO_NETWORK";
  if (raw.indexOf("RECONNECT") >= 0) return "RECONNECTING";
  if (raw.indexOf("FAIL") >= 0 || raw.indexOf("ERROR") >= 0) return "FAILED";
  return raw;
};

const getActiveServerName = () => {
  const { serverState } = useServers();
  const selectedId = serverState.selectedConfigId;
  const server = useServers().getServerById(selectedId);
  return server?.name || "";
};

export const getBridgeVpnState = () => {
  if (!sdk || !hasBridge("DtGetVpnState")) {
    return "";
  }
  return normalizeVpnState(sdk.main.getVpnState());
};

export const applyVpnState = (value) => {
  const normalized = normalizeVpnState(value);
  if (!normalized) return;
  vpnState.value = normalized;

  if (normalized === "CONNECTED") {
    setConnectedState();
    return;
  }
  if (normalized === "DISCONNECTED") {
    setDisconnectedState();
    return;
  }
  if (normalized === "CONNECTING" || normalized === "AUTH" || normalized === "RECONNECTING") {
    isConnected.value = false;
    isConnecting.value = true;
    connectPanelClass.value = "connecting";
    connectStatus.value = "Conectando...";
    return;
  }
  if (normalized === "STOPPING") {
    isConnected.value = false;
    isConnecting.value = true;
    connectPanelClass.value = "connecting";
    connectStatus.value = "Desconectando...";
    return;
  }
  if (normalized === "AUTH_FAILED") {
    setDisconnectedState();
    connectStatus.value = "Falla de autenticación";
    setAutoAuthErrorText(`Falla al autenticar en ${getActiveServerName() || "Servidor"}. Verifica tus credenciales.`);
    openModal("auto-auth-error");
    return;
  }
  if (normalized === "NO_NETWORK") {
    setDisconnectedState();
    connectStatus.value = "Sin red";
    return;
  }
  if (normalized === "FAILED") {
    const { serverState, stopAutoServerTesting } = useServers();
    if (serverState.autoTesting.active) {
      stopAutoServerTesting();
    }
    setDisconnectedState();
    connectStatus.value = "Falla de conexión";
  }
};

let pendingVpnAction = "";

export const handleConnectAction = () => {
  const { validateCredentials, getCredentialErrorMessage, persistCredentialFields, syncCredentialFieldsToBridge } = useCredentials();
  const { getServerById, serverState } = useServers();

  if (!sdk) {
    connectStatus.value = "SDK DT no disponible";
    return;
  }

  if (["STOPPING"].includes(vpnState.value)) {
    return;
  }

  const canStop = ["CONNECTED", "CONNECTING", "AUTH", "RECONNECTING"].includes(vpnState.value);
  if (canStop) {
    if (!hasBridge("DtExecuteVpnStop")) {
      connectStatus.value = "Bridge de desconexión no disponible";
      return;
    }
    const { stopAutoServerTesting } = useServers();
    stopAutoServerTesting();
    pendingVpnAction = "stop";
    sdk.main.stopVpn();
    applyVpnState("STOPPING");
    return;
  }

  const hasAnyCredentials =
    (normalizeText(useCredentials().username.value) &&
      normalizeText(useCredentials().password.value)) ||
    normalizeText(useCredentials().uuid.value);

  if (serverState.autoServerMode && !hasAnyCredentials) {
    openModal("credentials");
    connectStatus.value = "Llene usuario/contraseña o UUID";
    return;
  }

  if (!serverState.autoServerMode && !validateCredentials()) {
    openModal("credentials");
    connectStatus.value = getCredentialErrorMessage();
    return;
  }

  if (!serverState.autoServerMode && !getServerById(serverState.selectedConfigId)) {
    openModal("server");
    connectStatus.value = "Elige una configuración";
    return;
  }

  persistCredentialFields();
  syncCredentialFieldsToBridge();

  // TODO: handle auto server testing
  if (serverState.autoServerMode) {
    const { startAutoServerTesting } = useServers();
    if (!startAutoServerTesting()) {
      connectStatus.value = "Nivel automático no disponible o sin servidores";
    }
    return;
  }

  if (!hasBridge("DtExecuteVpnStart")) {
    connectStatus.value = "Bridge de conexión no disponible";
    return;
  }

  pendingVpnAction = "start";
  sdk.main.startVpn();
  applyVpnState(vpnState.value === "CONNECTED" ? "RECONNECTING" : "CONNECTING");
};

export const useVpn = () => ({
  vpnState,
  isConnected,
  isConnecting,
  connectStatus,
  activeTime,
  connectPanelClass,
  handleConnectAction,
  setDisconnectedState,
  applyVpnState,
  getBridgeVpnState,
});
