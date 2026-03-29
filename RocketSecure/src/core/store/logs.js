import { ref } from "vue";
import { sdk, hasBridge } from "../bridge/sdk";
import { ALLOWED_LOG_TAGS } from "../../utils/helpers";

export const logLines = ref([]);
export const logsLoading = ref(false);

const formatLogEntry = (entry) => {
  if (typeof entry === "string") {
    return entry;
  }
  if (!entry || typeof entry !== "object") {
    return "";
  }
  const timestamp =
    entry.timestamp || entry.time || entry.hour || entry.created_at || "";
  const message =
    entry.message || entry.log || entry.content || entry.text || entry.line || "";
  const fallback = Object.values(entry)
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(String)
    .join(" ");
  const text = message ? String(message) : fallback;
  if (!text) {
    return "";
  }
  return timestamp && String(text).indexOf(String(timestamp)) !== 0
    ? `${timestamp} - ${text}`
    : text;
};

const sanitizeHtml = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = String(html);
  
  const clean = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent || "";
      return text.replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] || char);
    }
    if (node.nodeType !== 1) return "";
    
    const tag = node.tagName.toUpperCase();
    if (!ALLOWED_LOG_TAGS[tag]) {
      return Array.prototype.map.call(node.childNodes, clean).join("");
    }
    
    const children = Array.prototype.map.call(node.childNodes, clean).join("");
    return `<${tag.toLowerCase()}>${children}</${tag.toLowerCase()}>`;
  };
  
  return Array.prototype.map.call(div.childNodes, clean).join("");
};

export const refreshLogs = () => {
  if (!hasBridge("DtGetLogs")) {
    logLines.value = [];
    return;
  }
  
  const raw = sdk.main.getLogs();
  if (!Array.isArray(raw)) {
    logLines.value = [];
    return;
  }
  
  logLines.value = raw
    .slice(-200)
    .map(formatLogEntry)
    .filter(Boolean)
    .map(sanitizeHtml);
};

export const clearLogs = () => {
  if (hasBridge("DtClearLogs")) {
    sdk.main.clearLogs();
    logLines.value = [];
    return true;
  }
  return false;
};

// Global listener for new logs
export const logsDirty = ref(true);
window.DtNewLogEvent = () => {
  logsDirty.value = true;
  if (window.activeModalId === "logs" || (typeof window.isLogsModalOpen === "function" && window.isLogsModalOpen())) {
     refreshLogs();
  }
};
