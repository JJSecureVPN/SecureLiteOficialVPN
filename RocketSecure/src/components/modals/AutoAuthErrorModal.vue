<template>
  <div
    class="auto-auth-error-modal modal"
    id="auto-auth-error-modal"
  >
    <div
      class="auto-result-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Error de autenticación"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <div class="auto-result-icon error" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 8v5" />
                <path d="M12 16h.01" />
                <path
                  d="M10.3 3.4 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0z"
                />
              </svg>
            </div>
            <h3 class="modal-title">Error de autenticación</h3>
          </div>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="auto-result-sub" id="auto-auth-error-text">{{ autoAuthErrorText }}</div>
    </div>
  </div>
</template>

<script setup>
import { useModals } from "../../composables/useModals";

const { closeModal } = useModals();
const close = () => closeModal();
</script>

<style scoped>
.auto-result-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.auto-result-icon {
  width: 54px;
  height: 54px;
  margin: 4px auto 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(216, 232, 255, 0.24);
}

.auto-result-icon svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.auto-result-icon.success {
  color: #64da9b;
  background: rgba(40, 209, 124, 0.14);
}

.auto-result-icon.error {
  color: #ff7c98;
  background: rgba(255, 94, 125, 0.12);
}

.auto-result-title {
  margin: 0;
  font-size: 17px;
  color: #e8ecff;
  font-weight: 700;
}

.auto-result-sub {
  margin: 8px 0 14px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.45;
}

.auto-result-actions {
  display: flex;
  justify-content: center;
}
</style>
