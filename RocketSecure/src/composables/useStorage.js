export const safeStorageGet = (key) => {
  try {
    return window.localStorage.getItem(key) || "";
  } catch (error) {
    return "";
  }
};

export const safeStorageSet = (key, value) => {
  try {
    if (value === null || value === undefined || value === "") {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, String(value));
  } catch (error) {
    // ignore
  }
};
