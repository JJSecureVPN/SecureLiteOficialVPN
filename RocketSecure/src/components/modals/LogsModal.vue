<template>
  <div
    class="logs-modal modal"
    id="logs-modal"
  >
    <div class="logs-sheet" role="dialog" aria-modal="true" aria-label="Logs">
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon"><svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg></span>
            <h3 class="modal-title">Logs</h3>
          </div>
        </div>
        <div class="logs-actions">
          <button class="close-btn" type="button" @click="handleClear">Limpiar</button>
          <button class="close-btn" type="button" @click="close">Cerrar</button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="logs-content" ref="scrollRef">
        <div v-for="(line, index) in logLines" :key="index" class="log-line" v-html="line"></div>
        <div v-if="logLines.length === 0" class="logs-empty">Sin logs disponibles</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick, onMounted } from "vue";
import { useModals } from "../../composables/useModals";
import { logLines, refreshLogs, clearLogs } from "../../core/store/logs";

const { activeModalId, closeModal } = useModals();
const isOpen = computed(() => activeModalId.value === "logs");
const scrollRef = ref(null);

const close = () => {
  closeModal();
};

const handleClear = () => {
  clearLogs();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  });
};

watch(isOpen, (newVal) => {
  if (newVal) {
    refreshLogs();
    scrollToBottom();
  }
});

watch(logLines, () => {
  if (isOpen.value) {
    scrollToBottom();
  }
}, { deep: true });

onMounted(() => {
  if (isOpen.value) {
    refreshLogs();
    scrollToBottom();
  }
});

// Expose open state to global for service trigger
window.isLogsModalOpen = () => isOpen.value;
</script>

<style scoped>
.logs-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.logs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}

.logs-head h3 {
  margin: 0;
  font-size: 16px;
}

.logs-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logs-content {
  min-height: 180px;
  max-height: 42vh;
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(39, 39, 42, 0.62);
  padding: 10px;
  font-size: 12px;
  line-height: 1.4;
  color: #dceaff;
}

.log-line {
  padding: 5px 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 6px;
  word-break: break-word;
}

.logs-empty {
  color: var(--muted);
  text-align: center;
  padding: 16px 6px;
  font-size: 13px;
}
</style>
