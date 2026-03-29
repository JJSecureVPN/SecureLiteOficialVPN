<template>
  <div
    class="auto-connect-modal modal"
    id="auto-connect-modal"
  >
    <div
      class="auto-connect-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Conexión automática"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <h3 class="modal-title">Conexión automática</h3>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="auto-connect-loading">
        <div class="auto-connect-spinner-row">
          <span class="auto-connect-spinner" aria-hidden="true"></span>
          <span>Probando servidores disponibles...</span>
        </div>
        <div class="auto-connect-current" id="auto-connect-current">
          Actual: {{ currentServerName }}
        </div>
      </div>
      <div class="auto-connect-grid">
        <div class="auto-connect-box">
          <span class="auto-connect-label">Total servidores</span>
          <span class="auto-connect-value" id="auto-connect-total">{{ totalServers }}</span>
        </div>
        <div class="auto-connect-box">
          <span class="auto-connect-label">Total probados</span>
          <span class="auto-connect-value" id="auto-connect-tested">{{ testedServers }}</span>
        </div>
      </div>
      <div class="auto-connect-progress">
        <div
          class="auto-connect-progress-fill"
          id="auto-connect-progress-fill"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { useServers } from "../../core/store/servers";

const { closeModal } = useModals();

const close = () => closeModal();

const totalServers = computed(() => serverState.autoTesting.queue.length);
const testedServers = computed(() => Math.min(serverState.autoTesting.index, totalServers.value));

const currentServerName = computed(() => {
  const index = serverState.autoTesting.index;
  const server = serverState.autoTesting.queue[index];
  return server?.name || "preparando...";
});

const progress = computed(() => {
  const total = totalServers.value;
  if (!total) return 0;
  return Math.min(100, (testedServers.value / total) * 100);
});

watch(
  () => serverState.autoTesting.queue,
  () => {
    // just trigger recomputation
  },
);
</script>

<style scoped>
.auto-connect-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.auto-connect-head h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #e8ecff;
}

.auto-connect-loading {
  display: grid;
  gap: 10px;
  border-top: 1px solid rgba(139, 110, 255, 0.22);
  background: rgba(91, 63, 214, 0.08);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.auto-connect-spinner-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d8e8ff;
  font-size: 13px;
  font-weight: 600;
}

.auto-connect-spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(248, 247, 255, 0.35);
  border-top-color: #a28eff;
  animation: auto-connect-spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes auto-connect-spin {
  to {
    transform: rotate(360deg);
  }
}

.auto-connect-current {
  font-size: 13px;
  color: #e8ecff;
  font-weight: 700;
}

.auto-connect-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.auto-connect-box {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  min-height: 64px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.auto-connect-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.55px;
  margin-bottom: 4px;
}

.auto-connect-value {
  font-size: 15px;
  font-weight: 800;
  color: #e8ecff;
}

.auto-connect-progress {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-top: 4px;
}

.auto-connect-progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #5b3fd6, #8b6eff);
  transition: width 180ms linear;
}
</style>
