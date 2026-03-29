<template>
  <div
    class="checkuser-modal modal"
    id="checkuser-modal"
  >
    <div class="checkuser-sheet" role="dialog" aria-modal="true" aria-label="Datos del usuario">
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div v-if="userData?.username" class="user-identity">
          <div class="user-avatar">{{ userInitials }}</div>
          <div>
            <p class="user-name">{{ userData.username }}</p>
            <p class="user-subtitle">VPN Cuenta</p>
          </div>
        </div>
        <h3 v-else class="modal-title">Datos del usuario</h3>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="checkuser-body" id="checkuser-modal-body">
        <div v-if="checkuserLoading" class="checkuser-loading">Verificando datos del usuario...</div>
        <div v-else-if="checkuserError" class="checkuser-loading">{{ checkuserError }}</div>
        <div v-else-if="userData" class="checkuser-content">

          <!-- Estado de conexión -->
          <div v-if="userData.showConnected" class="connection-card">
            <div class="connection-icon">
              <svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>
            </div>
            <div class="connection-info">
              <p class="connection-title">Conectado con éxito</p>
              <p class="connection-sub">{{ userData.lastConnectedServerName }}</p>
            </div>
            <div class="connection-dot"></div>
          </div>

          <!-- Barra de vigencia -->
          <div class="expiry-section">
            <div class="expiry-header">
              <span class="expiry-label">Vigencia de la cuenta</span>
              <span class="expiry-date">Vence el <strong>{{ userData.expirationDate }}</strong></span>
            </div>
            <div class="expiry-bar-track">
              <div class="expiry-bar-fill" :style="{ width: expiryPercent + '%' }"></div>
            </div>
            <div class="expiry-footer">
              <span class="expiry-start">Hoy</span>
              <span class="expiry-remaining">{{ userData.expDaysText }}</span>
            </div>
          </div>

          <div class="divider-line"></div>

          <!-- Métricas -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
                Conexiones
              </div>
              <p class="metric-value">{{ userData.connectionsText }}</p>
              <p class="metric-sub">dispositivos activos</p>
            </div>
            <div class="metric-card">
              <div class="metric-label">
                <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                Estado
              </div>
              <p class="metric-value" :class="userData.statusActive ? 'active' : 'inactive'">
                {{ userData.statusText }}
              </p>
              <p class="metric-sub">cuenta {{ userData.statusActive ? 'vigente' : 'vencida' }}</p>
            </div>
          </div>

        </div>
        <div v-else class="checkuser-loading">No hay datos disponibles.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, onBeforeUnmount } from "vue";
import { useModals } from "../../composables/useModals";
import { useCheckuser } from "../../core/store/checkuser";
import { sdk, hasBridge } from "../../core/bridge/sdk";

const { activeModalId, closeModal } = useModals();
const {
  userData,
  checkuserLoading,
  checkuserError,
  startCheckuserResponseTimeout,
  getCachedCheckuserData,
  handleCheckuserModel,
} = useCheckuser();

const isOpen = computed(() => activeModalId.value === "checkuser");

// ── TV / landscape mode ──────────────────────────────────────────────────────
const isTvMode = ref(false);
const tvModeMediaQuery = window.matchMedia("(orientation: landscape)");

const updateTvMode = () => {
  isTvMode.value = tvModeMediaQuery.matches;
};

// ── Auto-close (solo en TV mode) ─────────────────────────────────────────────
const autoCloseTimeoutId = ref(null);

const clearAutoClose = () => {
  if (autoCloseTimeoutId.value) {
    window.clearTimeout(autoCloseTimeoutId.value);
    autoCloseTimeoutId.value = null;
  }
};

const scheduleAutoClose = () => {
  clearAutoClose();
  autoCloseTimeoutId.value = window.setTimeout(() => {
    close();
  }, 5000);
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  updateTvMode();
  if (tvModeMediaQuery.addEventListener) {
    tvModeMediaQuery.addEventListener("change", updateTvMode);
  } else if (tvModeMediaQuery.addListener) {
    tvModeMediaQuery.addListener(updateTvMode);
  }
});

onBeforeUnmount(() => {
  if (tvModeMediaQuery.removeEventListener) {
    tvModeMediaQuery.removeEventListener("change", updateTvMode);
  } else if (tvModeMediaQuery.removeListener) {
    tvModeMediaQuery.removeListener(updateTvMode);
  }
  clearAutoClose();
});

// ── Computeds de UI ───────────────────────────────────────────────────────────

// Título legacy (por si algún otro componente lo usa via provide/emit)
const modalTitle = computed(() => {
  if (userData.value?.username) {
    return userData.value.username;
  }
  return "Datos del usuario";
});

// Iniciales para el avatar: toma las primeras dos letras del username.
// Si el username tiene forma "juan.perez" toma la inicial de cada parte.
const userInitials = computed(() => {
  const name = userData.value?.username;
  if (!name) return "?";
  const parts = name.split(/[.\-_\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

// Porcentaje de vigencia consumida (0–100) para la barra de progreso.
// Intenta leer expDays y totalDays desde userData; si el backend no manda
// totalDays asume 30 días como período estándar.
const expiryPercent = computed(() => {
  const data = userData.value;
  if (!data) return 0;

  // días restantes: acepta expDays (número) o lo parsea desde expDaysText
  const remaining =
    typeof data.expDays === "number"
      ? data.expDays
      : parseInt(data.expDaysText ?? "0", 10);

  // días totales del período: viene del modelo o fallback de 30
  const total =
    typeof data.totalDays === "number" && data.totalDays > 0
      ? data.totalDays
      : 30;

  // La barra muestra cuánto QUEDA, no cuánto se consumió
  const percent = (remaining / total) * 100;
  return Math.round(Math.max(0, Math.min(100, percent)));
});

// ── Acciones ──────────────────────────────────────────────────────────────────
const close = () => {
  closeModal();
};

const triggerCheckUser = () => {
  if (sdk && hasBridge("DtStartCheckUser")) {
    startCheckuserResponseTimeout();
    sdk.main.startCheckUser();
  } else {
    // Fallback a caché si el bridge no está disponible (simulador o faltante)
    const cached = getCachedCheckuserData();
    if (cached) {
      handleCheckuserModel(cached);
    }
    // Si no hay bridge ni caché, checkuserError se encargará de mostrar el estado
  }
};

// ── Watcher principal ─────────────────────────────────────────────────────────
watch(
  [isOpen, isTvMode],
  ([newIsOpen, tvMode]) => {
    if (newIsOpen) {
      triggerCheckUser();
      if (tvMode) {
        scheduleAutoClose();
      }
    } else {
      clearAutoClose();
    }
  },
);
</script>

<style scoped>
.checkuser-sheet {
  width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 100%);
  border-radius: 22px 22px 0 0;
  padding: 16px 20px calc(24px + var(--navigation-offset));
  border-top: 0.5px solid rgba(255,255,255,0.1);
}

.modal-drag-handle {
  width: 36px; height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  margin: 0 auto 20px;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.user-identity { display: flex; align-items: center; gap: 12px; }

.user-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B6DE0, #5B8DF6);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
  flex-shrink: 0;
}

.user-name { margin: 0; font-size: 16px; font-weight: 700; color: #e8ecff; }
.user-subtitle { margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.4); }

.close-btn {
  background: rgba(255,255,255,0.07);
  border: 0.5px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 6px 12px;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  cursor: pointer;
}

.checkuser-body { min-height: 200px; }
.checkuser-content { display: flex; flex-direction: column; gap: 16px; }

/* Estado de conexión */
.connection-card {
  display: flex; align-items: center; gap: 12px;
  background: rgba(40,209,124,0.08);
  border: 0.5px solid rgba(40,209,124,0.3);
  border-radius: 14px;
  padding: 14px 16px;
}
.connection-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(40,209,124,0.15);
  border: 1px solid rgba(40,209,124,0.35);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: #64da9b;
}
.connection-icon svg {
  width: 18px; height: 18px; fill: none;
  stroke: currentColor; stroke-width: 2.5;
  stroke-linecap: round; stroke-linejoin: round;
}
.connection-title { margin: 0; font-size: 13px; font-weight: 700; color: #64da9b; }
.connection-sub { margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.4); }
.connection-dot {
  margin-left: auto; width: 8px; height: 8px; border-radius: 50%;
  background: #64da9b;
  box-shadow: 0 0 6px rgba(100,218,155,0.6);
  flex-shrink: 0;
}

/* Barra de vigencia */
.expiry-section { display: flex; flex-direction: column; gap: 6px; }
.expiry-header { display: flex; justify-content: space-between; align-items: baseline; }
.expiry-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.6px; }
.expiry-date { font-size: 12px; color: rgba(255,255,255,0.55); }
.expiry-date strong { color: #e8ecff; font-weight: 600; }
.expiry-bar-track {
  height: 6px; background: rgba(255,255,255,0.08);
  border-radius: 3px; overflow: hidden;
}
.expiry-bar-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #3B6DE0, #7B9FFF);
  transition: width 0.6s ease;
}
.expiry-footer { display: flex; justify-content: space-between; }
.expiry-start { font-size: 11px; color: rgba(255,255,255,0.3); }
.expiry-remaining { font-size: 12px; font-weight: 600; color: #7B9FFF; }

.divider-line { height: 0.5px; background: rgba(255,255,255,0.08); }

/* Métricas */
.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.metric-card {
  padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  border: 0.5px solid rgba(255,255,255,0.07);
  border-radius: 12px;
}
.metric-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; color: rgba(255,255,255,0.35);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.metric-label svg {
  width: 12px; height: 12px; fill: none;
  stroke: currentColor; stroke-width: 2; stroke-linecap: round;
  flex-shrink: 0;
}
.metric-value { margin: 0; font-size: 22px; font-weight: 700; color: #e8ecff; line-height: 1; }
.metric-value.active { color: var(--green, #64da9b); }
.metric-value.inactive { color: var(--red, #f87171); }
.metric-sub { margin: 4px 0 0; font-size: 11px; color: rgba(255,255,255,0.3); }

.checkuser-loading { text-align: center; color: rgba(255,255,255,0.35); font-size: 13px; padding: 40px 10px; }

@media (orientation: landscape) {
  /* No special display: none here since manager handles it */
}
</style>
