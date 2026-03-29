<template>
  <div
    class="hotspot-modal modal"
    id="hotspot-modal"
  >
    <div
      class="hotspot-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Hotspot"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon"><svg viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg></span>
            <h3 class="modal-title">Hotspot</h3>
          </div>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="hotspot-card">
        <svg
          class="hotspot-wifi"
          id="hotspot-wifi-icon"
          viewBox="0 0 120 80"
          aria-hidden="true"
          :class="{ live: isRunning }"
        >
          <path
            class="wave wave-3"
            d="M16 34c12-11 28-17 44-17s32 6 44 17"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
          />
          <path
            class="wave wave-2"
            d="M29 47c8-8 19-12 31-12s23 4 31 12"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
          />
          <path
            class="wave wave-1"
            d="M44 60c4-4 10-6 16-6s12 2 16 6"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
          />
          <circle cx="60" cy="69" r="5" fill="currentColor" />
        </svg>
        <p class="hotspot-state-title" id="hotspot-state-title">
          {{ titleText }}
        </p>
        <p class="hotspot-state-sub" id="hotspot-state-sub">
          {{ subtitleText }}
        </p>
        <button
          class="hotspot-toggle-btn"
          type="button"
          id="hotspot-toggle-btn"
          :class="{ active: isRunning }"
          @click="toggleHotspot"
        >
          {{ isRunning ? "Desactivar hotspot" : "Activar hotspot" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { hotSpotState, refreshHotSpotState, startRouting, stopRouting } from "../../core/store/hotspot";

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === "hotspot");
const isRunning = computed(() => hotSpotState.value === "RUNNING");

const titleText = computed(() =>
  isRunning.value ? "Hotspot ativado" : "Hotspot desativado",
);

const subtitleText = computed(() =>
  isRunning.value
    ? "Sua rede está compartilhando internet agora."
    : "Ative para compartilhar sua conexão VPN com outros dispositivos.",
);

const close = () => {
  closeModal();
};

const toggleHotspot = () => {
  refreshHotSpotState();
  if (isRunning.value) {
    stopRouting();
  } else {
    startRouting();
  }
  [220, 900, 1600].forEach((delay) => {
    window.setTimeout(refreshHotSpotState, delay);
  });
};

watch(isOpen, (open) => {
  if (open) {
    refreshHotSpotState();
  }
});
</script>

<style scoped>
.hotspot-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.hotspot-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.hotspot-head h3 {
  margin: 0;
  font-size: 16px;
}

.hotspot-card {
  border: 1px solid rgba(216, 232, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 14px 12px;
  text-align: center;
  display: grid;
  gap: 10px;
}

.hotspot-wifi {
  width: 88px;
  height: 60px;
  margin: 0 auto;
  color: #8ea3c6;
}

.hotspot-wifi.live {
  color: #6fd9a1;
}

.hotspot-wifi .wave {
  opacity: 0.35;
  transform-origin: center;
}

.hotspot-wifi.live .wave-1 {
  animation: hotspot-wave 1s infinite;
}

.hotspot-wifi.live .wave-2 {
  animation: hotspot-wave 1s infinite 0.18s;
}

.hotspot-wifi.live .wave-3 {
  animation: hotspot-wave 1s infinite 0.36s;
}

@keyframes hotspot-wave {
  0% {
    opacity: 0.22;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.22;
  }
}

.hotspot-state-title {
  margin: 0;
  font-size: 16px;
  color: #e8ecff;
  font-weight: 700;
}

.hotspot-state-sub {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.45;
}

.hotspot-toggle-btn {
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #d8e8ff;
  font-size: 13px;
  border-radius: 10px;
  padding: 9px 12px;
  cursor: pointer;
}

.hotspot-toggle-btn.active {
  border-color: rgba(40, 209, 124, 0.5);
  background: rgba(40, 209, 124, 0.18);
  color: #e7fff2;
}
</style>
