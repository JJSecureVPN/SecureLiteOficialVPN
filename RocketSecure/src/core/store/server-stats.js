import { computed, isRef, onUnmounted, ref, watch } from "vue";

const DEFAULT_STATS_URL = "https://shop.jhservices.com.ar/api/realtime/snapshot";

export function useServerStats({ url = DEFAULT_STATS_URL, pollMs = 5000, enabled = true } = {}) {
  const stats = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const hasLoaded = ref(false);

  const enabledRef = isRef(enabled) ? enabled : ref(enabled);

  let intervalId = null;
  let cancelled = false;

  const stopPolling = () => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  const loadStats = async () => {
    if (!enabledRef.value) return;

    const isFirstLoad = !hasLoaded.value;
    loading.value = isFirstLoad;
    error.value = null;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const payload = json?.data?.serverStats ?? json?.serverStats;

      if (!payload || typeof payload.totalUsers !== "number") {
        throw new Error("Respuesta inválida");
      }

      if (!cancelled) {
        stats.value = payload;
        error.value = null;
        hasLoaded.value = true;
      }
    } catch (err) {
      if (!cancelled) {
        stats.value = null;
        error.value = err instanceof Error ? err.message : String(err);
      }
    } finally {
      if (!cancelled) {
        // Keep loading = false after first successful load; avoid flashing.
        if (!hasLoaded.value) {
          loading.value = false;
        }
      }
    }
  };

  const startPolling = () => {
    if (intervalId) return;
    loadStats();
    intervalId = window.setInterval(loadStats, pollMs);
  };

  const stopPollingAndReset = () => {
    stopPolling();
    if (!cancelled) {
      stats.value = null;
      loading.value = false;
      error.value = null;
    }
  };

  watch(
    enabledRef,
    (value) => {
      if (value) {
        startPolling();
      } else {
        stopPollingAndReset();
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    cancelled = true;
    stopPolling();
  });

  const totalUsers = computed(() => stats.value?.totalUsers ?? null);
  const onlineServers = computed(() => stats.value?.onlineServers ?? null);
  const serverRegion = computed(() => {
    const servers = stats.value?.servers ?? [];
    if (!servers.length) return null;
    const region = servers[0]?.location ?? servers[0]?.serverName ?? null;
    return region ? String(region) : null;
  });

  const cpuAverage = computed(() => {
    const servers = stats.value?.servers ?? [];
    const values = servers
      .map((s) => typeof s.cpuUsage === "number" ? s.cpuUsage : null)
      .filter((v) => v !== null);
    if (!values.length) return null;
    return Math.round(values.reduce((sum, v) => sum + (v ?? 0), 0) / values.length);
  });

  const memoryAverage = computed(() => {
    const servers = stats.value?.servers ?? [];
    const values = servers
      .map((s) => typeof s.memoryUsage === "number" ? s.memoryUsage : null)
      .filter((v) => v !== null);
    if (!values.length) return null;
    return Math.round(values.reduce((sum, v) => sum + (v ?? 0), 0) / values.length);
  });

  return {
    totalUsers,
    onlineServers,
    cpuAverage,
    memoryAverage,
    serverRegion,
    loading,
    error,
  };
}
