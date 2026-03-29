export const formatTime = (seconds) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
};

export const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

export const normalizeSearch = (value) =>
  normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const escapeHtml = (value) =>
  String(value == null ? "" : value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });

export const getInitials = (name) => {
  const parts = normalizeText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) {
    return "MV";
  }
  return parts.map((part) => part.charAt(0)).join("").toUpperCase();
};

export const isV2RayMode = (mode) =>
  normalizeText(mode).toUpperCase().indexOf("V2RAY") >= 0;

export const ALLOWED_LOG_TAGS = {
  B: true,
  STRONG: true,
  I: true,
  EM: true,
  U: true,
  S: true,
  BR: true,
  CODE: true,
};
