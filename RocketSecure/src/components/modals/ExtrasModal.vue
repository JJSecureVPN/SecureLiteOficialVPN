<template>
  <div
    class="extras-modal modal"
    id="extras-modal"
  >
    <div
      class="extras-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Extras"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
            <h3 class="modal-title">Extras</h3>
          </div>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="extras-list">
        <button class="extras-action" type="button" @click="handleBattery">
          <span>Optimizar batería</span>
        </button>
        <button class="extras-action" type="button" @click="handleApn">
          <span>Editar APN</span>
        </button>
        <button class="extras-action" type="button" @click="handleNetwork">
          <span>Configuración de red</span>
        </button>
        <button class="extras-action" type="button" @click="handleRouting">
          <span>
            Hotspot
            <span
              class="extras-meta"
              id="extras-routing-status"
              :class="{ 'status-active': isRunning, 'status-inactive': !isRunning }"
            >
              {{ routingStatus }}
            </span>
          </span>
        </button>
        <button class="extras-action" type="button" @click="handleShop">
          <span>Comprar / Revender</span>
        </button>
        <button class="extras-action" type="button" @click="handleHelp">
          <span>Ayuda / Soporte</span>
        </button>
        <button class="extras-action" type="button" @click="handleClean">
          <span>Limpiar aplicación</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { handleBatteryAction, handleApnAction, handleNetworkAction, handleRoutingAction, handleCleanAppAction } from "../../core/store/extras";
import { hotSpotState, refreshHotSpotState } from "../../core/store/hotspot";

const { activeModalId, closeModal, openModal } = useModals();
const isOpen = computed(() => activeModalId.value === "extras");
const isRunning = computed(() => hotSpotState.value === "RUNNING");
const routingStatus = computed(() => (isRunning.value ? "Activado" : "Desativado"));

watch(isOpen, (newVal) => {
  if (newVal) {
    refreshHotSpotState();
  }
});

const close = () => {
  closeModal();
};

const handleBattery = () => {
  handleBatteryAction();
  close();
};

const handleApn = () => {
  handleApnAction();
  close();
};

const handleNetwork = () => {
  handleNetworkAction();
  close();
};

const handleRouting = () => {
  handleRoutingAction();
};

const handleShop = () => {
  openModal('premium');
};

const handleHelp = () => {
  openModal('support');
};

const handleClean = () => {
  close();
  handleCleanAppAction();
};
</script>

<style scoped>
.extras-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.extras-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.extras-head h3 {
  margin: 0;
  font-size: 16px;
}

.extras-list {
  display: grid;
  gap: 8px;
}

.extras-action {
  width: 100%;
  border: 1px solid rgba(216, 232, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #d8e8ff;
  border-radius: 12px;
  padding: 11px 12px;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.extras-meta {
  font-size: 11px;
  font-weight: 500;
}

.extras-meta.status-active {
  color: var(--green);
  background: rgba(40, 209, 124, 0.13);
  border: 1px solid rgba(40, 209, 124, 0.35);
  border-radius: 999px;
  padding: 2px 8px;
}

.extras-meta.status-inactive {
  color: var(--red);
  background: rgba(255, 94, 125, 0.12);
  border: 1px solid rgba(255, 94, 125, 0.25);
  border-radius: 999px;
  padding: 2px 8px;
}

@media (orientation: landscape) {
  .extras-modal {
    max-width: 500px !important;
    bottom: 50% !important;
    left: 50% !important;
    transform: translate(-50%, 50%) !important;
  }

  /* Vue transition classes for landscape */
  .extras-modal.modal-enter-from,
  .extras-modal.modal-leave-to {
    transform: translate(-50%, 150%) scale(0.97) !important;
    opacity: 0 !important;
  }
}
</style>
