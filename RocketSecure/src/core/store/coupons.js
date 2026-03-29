import { onMounted, onUnmounted, ref } from "vue";

const COUPONS_URL = "https://shop.jhservices.com.ar/api/cupones";

// Singleton-like shared state to avoid multiple polling intervals.
const coupons = ref([]);
const loading = ref(false);
const error = ref(null);

let intervalId = null;
let subscribers = 0;
let lastPollInterval = 60_000;

const loadCoupons = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(COUPONS_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load coupons");
    }

    const data = await response.json();
    coupons.value = Array.isArray(data?.data) ? data.data : [];
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
};

const startPolling = (pollInterval) => {
  lastPollInterval = pollInterval;
  if (intervalId) return;
  loadCoupons();
  intervalId = window.setInterval(loadCoupons, pollInterval);
};

const stopPolling = () => {
  if (!intervalId) return;
  window.clearInterval(intervalId);
  intervalId = null;
};

export const useCoupons = (pollInterval = 60_000) => {
  onMounted(() => {
    subscribers += 1;
    if (subscribers === 1) {
      startPolling(pollInterval);
    } else if (pollInterval !== lastPollInterval) {
      // If someone requests a different interval, we restart to respect it.
      stopPolling();
      subscribers = Math.max(1, subscribers);
      startPolling(pollInterval);
    }
  });

  onUnmounted(() => {
    subscribers -= 1;
    if (subscribers <= 0) {
      subscribers = 0;
      stopPolling();
    }
  });

  return {
    coupons,
    loading,
    error,
    loadCoupons,
  };
};
