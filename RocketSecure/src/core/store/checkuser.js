import { ref, reactive } from "vue";
import { safeStorageGet, safeStorageSet } from "../../composables/useStorage";
import { normalizeText } from "../../utils/helpers";
import { useModals } from "../../composables/useModals";
import { STORAGE_KEYS } from "../../constants/storage-keys";


const CHECKUSER_LEGACY_CACHE_KEYS = [
  "vpn_app_ui_v11_lastUserData",
  "vpn_app_ui_v11_:lastUserData",
];

export const userData = ref(null);
export const checkuserLoading = ref(false);
export const checkuserError = ref("");

const checkUserState = reactive({
  requestedForCurrentConnection: false,
  waitingResponse: false,
  responseTimeoutId: null,
});

const autoResultState = reactive({
  connectedModalShown: false,
  showConnectedInCheckuser: false,
  lastConnectedServerName: "",
});

const getCachedCheckuserData = () => {
  const primary = safeStorageGet(STORAGE_KEYS.lastUserData);
  if (primary) return primary;
  for (const legacyKey of CHECKUSER_LEGACY_CACHE_KEYS) {
    const value = safeStorageGet(legacyKey);
    if (value) return value;
  }
  return "";
};

const extractCheckuserPayload = (rawValue) => {
  if (rawValue === null || rawValue === undefined) return "";
  if (typeof rawValue === "string") return rawValue;
  if (typeof rawValue === "object") {
    if (typeof rawValue.payload === "string") return rawValue.payload;
    if (typeof rawValue.modelJson === "string") return rawValue.modelJson;
    if (typeof rawValue.model === "string") return rawValue.model;
    try {
      return JSON.stringify(rawValue.payload ?? rawValue.model ?? rawValue);
    } catch (error) {
      return "";
    }
  }
  return String(rawValue);
};

const processAndRenderCheckuserData = (modelJson) => {
  try {
    const data = typeof modelJson === "string" ? JSON.parse(modelJson) : modelJson;
    const username = normalizeText(data?.username) || "N/D";
    const avatarLetter = username.charAt(0).toUpperCase() || "?";
    const rawExpDays = Number(data?.expiration_days);
    const hasExpDays = Number.isFinite(rawExpDays);
    const expDays = hasExpDays ? rawExpDays : -1;
    const expDaysText = hasExpDays ? `${String(expDays).padStart(2, "0")} días` : "N/D";
    const expirationDate = normalizeText(data?.expiration_date) || "N/D";
    const usedConnections = Number.isFinite(Number(data?.count_connections))
      ? Number(data?.count_connections)
      : "0";
    const maxConnections = Number.isFinite(Number(data?.limit_connections))
      ? Number(data?.limit_connections)
      : "N/D";
    const connectionsText = `${usedConnections}/${maxConnections}`;
    const statusActive = expDays >= 0;
    const statusText = statusActive ? "Activo" : "Inactivo";

    userData.value = {
      username,
      avatarLetter,
      expDaysText,
      expirationDate,
      connectionsText,
      statusText,
      statusActive,
      showConnected: autoResultState.showConnectedInCheckuser,
      lastConnectedServerName: autoResultState.lastConnectedServerName,
    };
    checkuserLoading.value = false;
    checkuserError.value = "";
  } catch (error) {
    checkuserError.value = "Datos del usuario inválidos.";
    checkuserLoading.value = false;
  }
};

const renderCheckuserError = (message) => {
  checkuserError.value = message || "No fue posible obtener los datos del usuario.";
  checkuserLoading.value = false;
};

const clearCheckuserResponseTimeout = () => {
  window.clearTimeout(checkUserState.responseTimeoutId);
  checkUserState.responseTimeoutId = null;
};

const startCheckuserResponseTimeout = () => {
  checkuserLoading.value = true;
  checkuserError.value = "";
  checkUserState.waitingResponse = true;
  clearCheckuserResponseTimeout();
  checkUserState.responseTimeoutId = window.setTimeout(() => {
    if (!checkUserState.waitingResponse) return;
    checkUserState.waitingResponse = false;
    const cachedData = getCachedCheckuserData();
    if (cachedData) {
      processAndRenderCheckuserData(cachedData);
      return;
    }
    renderCheckuserError("Sin respuesta del checkuser. Intenta reconectar.");
  }, 18000);
};

export const handleCheckuserModel = (rawModel) => {
  const payload = extractCheckuserPayload(rawModel);
  if (!payload) {
    if (!getCachedCheckuserData()) {
      renderCheckuserError("Datos del usuario no retornaron.");
    }
    return;
  }
  checkUserState.waitingResponse = false;
  clearCheckuserResponseTimeout();
  safeStorageSet(STORAGE_KEYS.lastUserData, payload);
  CHECKUSER_LEGACY_CACHE_KEYS.forEach((legacyKey) =>
    safeStorageSet(legacyKey, payload),
  );
  processAndRenderCheckuserData(payload);
};

export const setCheckuserConnectedInfo = (showConnected, serverName = "") => {
  autoResultState.showConnectedInCheckuser = !!showConnected;
  autoResultState.lastConnectedServerName = serverName || "";

  // Update rendered data if already loaded
  if (userData.value) {
    userData.value.showConnected = !!showConnected;
    userData.value.lastConnectedServerName = serverName || "";
  }
};

export const useCheckuser = () => ({
  userData,
  checkuserLoading,
  checkuserError,
  handleCheckuserModel,
  startCheckuserResponseTimeout,
  getCachedCheckuserData,
  autoResultState,
  checkUserState,
  setCheckuserConnectedInfo,
});

// expose global window listeners as in original code
window.processAndRenderUserData = (model) => {
  handleCheckuserModel(model);
};

const isTvMode = () => {
  // TV mode is detected by landscape orientation.
  // This matches how the app adjusts UI in src/assets/css/tv-mode.css.
  return window.matchMedia?.("(orientation: landscape)")?.matches ?? window.innerWidth > window.innerHeight;
};

window.dtCheckUserStartedListener = () => {
  const { openModal, closeModal, activeModalId } = useModals();
  const tvMode = isTvMode();

  // In TV mode we do not show the checkuser modal (it can be disruptive on TV screens).
  // We still run the background checkuser logic for completeness.
  if (!tvMode) {
    openModal("checkuser");
  } else if (activeModalId.value === "checkuser") {
    closeModal();
  }

  startCheckuserResponseTimeout();
};
window.DtCheckUserStartedListener = window.dtCheckUserStartedListener;

window.dtCheckUserModelListener = (model) => {
  const { openModal, closeModal, activeModalId } = useModals();
  const tvMode = isTvMode();

  if (!tvMode) {
    openModal("checkuser");
  } else if (activeModalId.value === "checkuser") {
    closeModal();
  }

  handleCheckuserModel(model);
};
window.DtCheckUserModelListener = window.dtCheckUserModelListener;
