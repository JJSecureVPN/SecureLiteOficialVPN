import { ref } from "vue";
import { sdk, hasBridge } from "../bridge/sdk";
import { normalizeText, formatTime } from "../../utils/helpers";

const localIp = ref("N/D");
const networkName = ref("N/D");
const configVersion = ref("N/D");
const appVersion = ref("N/D");

const download = ref("0 Mbps");
const upload = ref("0 Mbps");
const ping = ref("-- ms");

const totalDown = ref("0 MB");
const totalUp = ref("0 MB");
const totalUsed = ref("0 MB");

let trafficSessionBaseDownloadBytes = null;
let trafficSessionBaseUploadBytes = null;
let lastDownloadBytes = null;
let lastUploadBytes = null;
let lastTrafficAt = null;
let pollTimerId = null;

const formatTrafficData = (mb) => {
  if (!Number.isFinite(mb) || mb <= 0) {
    return "0 MB";
  }
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
};

const formatSpeed = (bytesPerSecond) => {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) {
    return { value: "0.00", unit: "KB/s" };
  }
  if (bytesPerSecond >= 1024 * 1024) {
    return {
      value: (bytesPerSecond / (1024 * 1024)).toFixed(2),
      unit: "MB/s",
    };
  }
  if (bytesPerSecond >= 1024) {
    return { value: (bytesPerSecond / 1024).toFixed(2), unit: "KB/s" };
  }
  return { value: bytesPerSecond.toFixed(0), unit: "B/s" };
};

const normalizePing = (value) => {
  const raw = normalizeText(value);
  if (!raw) {
    return "N/D";
  }
  if (/^\d+(\.\d+)?$/.test(raw)) {
    return `${raw} ms`;
  }
  if (/^\d+(\.\d+)?ms$/i.test(raw)) {
    return raw.replace(/ms/i, " ms");
  }
  return raw;
};

const setNodeText = (refVar, value, fallback = "N/D") => {
  const text =
    value === null || value === undefined || value === "" ? fallback : String(value);
  refVar.value = text;
};

const updateTrafficTotals = (downloadBytes, uploadBytes) => {
  if (downloadBytes >= 0 && uploadBytes >= 0) {
    const sessionDownload = Math.max(0, downloadBytes - (trafficSessionBaseDownloadBytes || 0));
    const sessionUpload = Math.max(0, uploadBytes - (trafficSessionBaseUploadBytes || 0));
    
    totalDown.value = formatTrafficData(sessionDownload / (1024 * 1024));
    totalUp.value = formatTrafficData(sessionUpload / (1024 * 1024));
    totalUsed.value = formatTrafficData((sessionDownload + sessionUpload) / (1024 * 1024));
  }
};

const applyZeroTrafficDisplay = () => {
  download.value = "0.00 KB/s";
  upload.value = "0.00 KB/s";
  ping.value = "-- ms";
};

const updateTrafficFromRuntime = (downloadBytes, uploadBytes, isConnected) => {
  const now = Date.now();
  
  if (!Number.isFinite(downloadBytes) || !Number.isFinite(uploadBytes) || !isConnected) {
    applyZeroTrafficDisplay();
    if (isConnected) {
      lastDownloadBytes = downloadBytes;
      lastUploadBytes = uploadBytes;
      lastTrafficAt = now;
    }
    return;
  }

  updateTrafficTotals(downloadBytes, uploadBytes);

  if (Number.isFinite(lastTrafficAt) && Number.isFinite(lastDownloadBytes) && Number.isFinite(lastUploadBytes)) {
    const elapsed = Math.max((now - lastTrafficAt) / 1000, 0.1);
    const dlRate = Math.max(0, downloadBytes - lastDownloadBytes) / elapsed;
    const ulRate = Math.max(0, uploadBytes - lastUploadBytes) / elapsed;
    
    const dlDisplay = formatSpeed(dlRate);
    const ulDisplay = formatSpeed(ulRate);
    
    download.value = `${dlDisplay.value} ${dlDisplay.unit}`;
    upload.value = `${ulDisplay.value} ${ulDisplay.unit}`;
  } else {
    applyZeroTrafficDisplay();
  }

  lastDownloadBytes = downloadBytes;
  lastUploadBytes = uploadBytes;
  lastTrafficAt = now;
};

export const resetTrafficSession = () => {
  const currentDownloadBytes = hasBridge("DtGetNetworkDownloadBytes")
    ? Number(sdk.android.getNetworkDownloadBytes())
    : 0;
  const currentUploadBytes = hasBridge("DtGetNetworkUploadBytes")
    ? Number(sdk.android.getNetworkUploadBytes())
    : 0;
  trafficSessionBaseDownloadBytes = Number.isFinite(currentDownloadBytes)
    ? currentDownloadBytes
    : 0;
  trafficSessionBaseUploadBytes = Number.isFinite(currentUploadBytes)
    ? currentUploadBytes
    : 0;
  updateTrafficTotals(trafficSessionBaseDownloadBytes, trafficSessionBaseUploadBytes);
};

export const refreshRuntimeData = () => {
  const downloadBytes = hasBridge("DtGetNetworkDownloadBytes")
    ? Number(sdk.android.getNetworkDownloadBytes())
    : null;
  const uploadBytes = hasBridge("DtGetNetworkUploadBytes")
    ? Number(sdk.android.getNetworkUploadBytes())
    : null;
  // Note: vpn status should be passed in by caller
  // We'll just update traffic here.
  updateTrafficFromRuntime(downloadBytes, uploadBytes, true);

  if (!hasBridge("DtGetPingResult")) {
    ping.value = "-- ms";
  } else {
    ping.value = normalizePing(sdk.main.getPingResult());
  }

  if (!hasBridge("DtGetNetworkName")) {
    networkName.value = "N/D";
  } else {
    networkName.value = normalizeText(sdk.main.getNetworkName());
  }

  if (!hasBridge("DtGetLocalIP")) {
    localIp.value = "N/D";
  } else {
    localIp.value = normalizeText(sdk.main.getLocalIp());
  }

  if (!hasBridge("DtGetLocalConfigVersion")) {
    configVersion.value = "N/D";
  } else {
    const version = sdk.config.getLocalConfigVersion();
    configVersion.value = normalizeText(String(version || ""));
  }

  if (!hasBridge("DtAppVersion")) {
    appVersion.value = "N/D";
  } else {
    const version = sdk.android.getAppVersion();
    appVersion.value = normalizeText(String(version || ""));
  }
};

let pollPaused = false;

export const pauseRuntimePoll = () => {
  pollPaused = true;
  if (pollTimerId) {
    window.clearTimeout(pollTimerId);
    pollTimerId = null;
  }
};

export const scheduleRuntimePoll = (immediate = false) => {
  pollPaused = false;
  if (pollTimerId) {
    window.clearTimeout(pollTimerId);
  }
  pollTimerId = window.setTimeout(() => {
    refreshRuntimeData();
    if (!pollPaused) {
      scheduleRuntimePoll();
    }
  }, immediate ? 0 : 500);
};

export const useRuntime = () => ({
  localIp,
  networkName,
  configVersion,
  appVersion,
  download,
  upload,
  ping,
  totalDown,
  totalUp,
  totalUsed,
  refreshRuntimeData,
  resetTrafficSession,
  scheduleRuntimePoll,
});
