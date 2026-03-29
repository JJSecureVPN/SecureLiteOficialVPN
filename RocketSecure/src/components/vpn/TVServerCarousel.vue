<template>
  <div class="tv-server-carousel">
    <div class="carousel-track" ref="track">
      <div 
        v-for="(server, index) in allServers" 
        :key="server.id"
        class="server-card"
        :class="{ active: isSelected(server.id) }"
        tabindex="0"
        ref="cards"
        @click="selectServer(server.id)"
        @keydown="handleKey($event, index)"
      >
        <div class="server-card-body">
          <div class="server-card-flag">{{ getInitials(server.name) }}</div>
          <div class="server-card-info">
            <div class="server-card-name">{{ server.name }}</div>
            <div class="server-card-category">{{ server.categoryName }}</div>
          </div>
        </div>
        <div class="server-card-footer">
          <div class="server-card-mode">{{ getMode(server.mode) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineExpose, defineEmits } from "vue";
import { useServers } from "../../core/store/servers";
import { getInitials } from "../../utils/helpers";

const { serverState, selectServerById } = useServers();
const emit = defineEmits(["nav-up", "nav-down"]);
const cards = ref([]);

const allServers = computed(() => {
  const list = [];
  serverState.categories.forEach(cat => {
    cat.items.forEach(item => {
      list.push(item);
    });
  });
  
  // If no servers, provide mocks for testing navigation
  if (list.length === 0) {
    return [
      { id: -1, name: "Servidor Mock 1", categoryName: "PRUEBA", mode: "UDP" },
      { id: -2, name: "Servidor Mock 2", categoryName: "PRUEBA", mode: "TCP" },
      { id: -3, name: "Servidor Mock 3", categoryName: "PRUEBA", mode: "SSL" },
      { id: -4, name: "Servidor Mock 4", categoryName: "PRUEBA", mode: "TLS" },
    ];
  }
  
  return list;
});

const isSelected = (id) => {
  return Number(id) === Number(serverState.selectedConfigId);
};

const selectServer = (id) => {
  selectServerById(id);
};

const focusFirst = () => {
  // Try to find active server index
  const activeIndex = allServers.value.findIndex(s => isSelected(s.id));
  const targetIndex = activeIndex >= 0 ? activeIndex : 0;
  if (cards.value[targetIndex]) {
    cards.value[targetIndex].focus();
    cards.value[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
};

const handleKey = (e, index) => {
  if (e.key === "ArrowRight") {
    if (cards.value[index + 1]) {
      cards.value[index + 1].focus();
      cards.value[index + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  } else if (e.key === "ArrowLeft") {
    if (cards.value[index - 1]) {
      cards.value[index - 1].focus();
      cards.value[index - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    emit("nav-up");
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    emit("nav-down");
  } else if (e.key === "Enter") {
    selectServer(allServers.value[index].id);
  }
};

defineExpose({ focusFirst });

const getMode = (mode) => {
  const m = (mode || "").toUpperCase();
  if (m.includes("UDP")) return "UDP";
  if (m.includes("TCP")) return "TCP";
  if (m.includes("SSL")) return "SSL";
  if (m.includes("TLS")) return "TLS";
  return m.split("_")[0] || "VPN";
};
</script>

<style scoped>
.tv-server-carousel {
  width: 100vw;
  margin-left: calc(-1 * var(--page-pad, 20px));
  margin-right: calc(-1 * var(--page-pad, 20px));
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 40px 20px;
  scrollbar-width: none;
}

.tv-server-carousel::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 12px;
  width: max-content;
  min-width: 100%;
  justify-content: center;
  padding: 0 40px;
}

.server-card {
  width: 240px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.server-card:hover {
  background: rgba(139, 110, 255, 0.08);
  border-color: rgba(139, 110, 255, 0.3);
  transform: translateY(-2px);
}

.server-card.active {
  background: rgba(139, 110, 255, 0.15);
  border-color: rgba(139, 110, 255, 0.6);
  box-shadow: 0 0 20px rgba(139, 110, 255, 0.2);
}

.server-card-body {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.server-card-flag {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6d4aff, #8b6eff);
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.server-card-info {
  flex: 1;
  min-width: 0; /* Important for ellipsis */
  text-align: left;
}

.server-card-name {
  font-size: clamp(13px, 1.8vw, 15px);
  font-weight: 700;
  color: #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.server-card-category {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.server-card-footer {
  display: flex;
  justify-content: flex-end;
}

.server-card-mode {
  font-size: 9px;
  padding: 3px 7px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  color: var(--muted);
  font-weight: 700;
}

@media (orientation: landscape) and (max-height: 500px) {
  .tv-server-carousel {
    padding-bottom: 10px !important;
  }
}
</style>
