<template>
  <div
    class="confirm-modal modal"
    id="confirm-modal"
  >
    <div
      class="confirm-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar limpieza"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon" style="background:rgba(255,94,125,0.12);box-shadow:0 0 14px rgba(255,94,125,0.18);color:#ff7c98"><svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span>
            <h3 class="modal-title">Limpiar aplicación</h3>
          </div>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="confirm-text">
        Esto limpiará los datos locales y cerrará la aplicación.
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn" type="button" @click="close">
          Cancelar
        </button>
        <button class="confirm-btn danger" type="button" @click="confirmClean">
          Limpiar y cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useModals } from "../../composables/useModals";
import { executeCleanAppAction } from "../../core/store/extras";

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === "confirm");

const close = () => {
  closeModal();
};

const confirmClean = () => {
  closeModal();
  executeCleanAppAction();
};
</script>

<style scoped>
.confirm-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.confirm-text {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.45;
  margin-bottom: 12px;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.confirm-btn {
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #d8e8ff;
  font-size: 13px;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.confirm-btn.danger {
  border-color: rgba(255, 110, 133, 0.42);
  background: rgba(255, 94, 125, 0.18);
  color: #ffd7df;
}
</style>
