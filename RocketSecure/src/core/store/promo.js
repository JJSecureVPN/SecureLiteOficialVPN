import { computed, onMounted, onUnmounted, ref } from "vue";

const PROMO_STATUS_URL = "https://shop.jhservices.com.ar/api/config/promo-status";

function formatRemaining(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours,
    minutes,
    seconds,
  };
}

export const usePromo = (pollInterval = 60_000) => {
  const promo = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const now = ref(Date.now());

  const loadPromo = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(PROMO_STATUS_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load promo");
      }

      const data = await response.json();
      const promoConfig = data?.promo_config ?? data?.data;
      if (!promoConfig || typeof promoConfig.activa !== "boolean") {
        promo.value = null;
      } else {
        promo.value = {
          activa: promoConfig.activa,
          activada_en: promoConfig.activada_en ?? null,
          duracion_horas: promoConfig.duracion_horas ?? 12,
          descuento_porcentaje: promoConfig.descuento_porcentaje,
        };
      }
    } catch (e) {
      error.value = e;
      promo.value = null;
    } finally {
      loading.value = false;
    }
  };

  const remainingMs = computed(() => {
    if (!promo.value?.activa || !promo.value.activada_en || !promo.value.duracion_horas) {
      return null;
    }

    const start = new Date(promo.value.activada_en).getTime();
    if (!Number.isFinite(start)) return null;

    return start + promo.value.duracion_horas * 60 * 60 * 1000 - now.value;
  });

  const remaining = computed(() => {
    if (remainingMs.value == null || remainingMs.value <= 0) return null;
    return formatRemaining(remainingMs.value);
  });

  const remainingLabel = computed(() => {
    if (!remaining.value) return null;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(remaining.value.hours)}:${pad(remaining.value.minutes)}:${pad(remaining.value.seconds)}`;
  });

  const isActive = computed(() => Boolean(promo.value?.activa && remainingMs.value > 0));

  let pollId;
  let tickId;

  onMounted(() => {
    loadPromo();
    pollId = window.setInterval(loadPromo, pollInterval);

    tickId = window.setInterval(() => {
      now.value = Date.now();
    }, 1000);
  });

  onUnmounted(() => {
    if (pollId) window.clearInterval(pollId);
    if (tickId) window.clearInterval(tickId);
  });

  return {
    promo,
    loading,
    error,
    isActive,
    remainingLabel,
    loadPromo,
  };
};
