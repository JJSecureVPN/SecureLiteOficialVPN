<template>
  <div
    class="server-modal modal"
    id="server-modal"
  >
    <div
      class="server-modal-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Seleccionar servidor"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
            <h3 class="modal-title">Seleccionar servidor</h3>
          </div>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="server-modal-body">
        <button
          class="server-auto-toggle"
          type="button"
          role="switch"
          :aria-checked="autoServerMode.toString()"
          @click="toggleAutoServer"
        >
          <span class="server-auto-text">
            <strong>Automático</strong>
            <span id="server-auto-status">{{ autoServerMode ? "Activado" : "Desactivado" }}</span>
          </span>
          <span
            class="route-toggle"
            id="server-auto-indicator"
            :class="{ active: autoServerMode }"
            aria-hidden="true"
          ></span>
        </button>
        <div
          class="server-auto-note"
          id="server-auto-note"
          v-if="autoServerMode"
        >
          Modo automático activado. La app elegirá y probará los servidores
          por sí sola antes de conectar.
        </div>
        <div class="server-tools" id="server-tools-wrap" v-if="!autoServerMode">
          <input
            class="server-search"
            id="server-search-input"
            type="text"
            placeholder="Buscar servidor..."
            v-model="search"
          />
          <button
            class="server-refresh-btn"
            type="button"
            id="refresh-servers-btn"
            @click="refresh"
          >
            Actualizar
          </button>
        </div>
        <div class="server-list-wrap" id="server-list-wrap">
          <div class="server-list">
            <!-- Loading state -->
            <button v-if="serverState.categories.length === 0" class="server-option active" type="button" disabled>
              <span><i class="dot"></i>Cargando servidores de la app...</span>
              <span class="ping">...</span>
            </button>

            <!-- Back to categories -->
            <button 
              v-if="!search.trim() && serverState.selectedCategoryId" 
              type="button" 
              class="server-back-icon-btn" 
              @click="setSelectedCategory(null)"
              aria-label="Volver a categorías"
            >
              <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
              <span>Volver a categorías</span>
            </button>

            <!-- Categories view -->
            <template v-if="!search.trim() && !serverState.selectedCategoryId">
              <button 
                v-for="cat in serverState.categories" 
                :key="cat.id"
                type="button" 
                class="server-category-option" 
                @click="setSelectedCategory(cat.id)"
              >
                <span><i class="dot"></i>{{ cat.name || "Categoría" }}</span>
                <span class="ping">{{ cat.items.length }}</span>
              </button>
            </template>

            <!-- Servers view (filtered by search or category) -->
            <template v-else>
              <!-- Show selected category header when browsing a category -->
              <div v-if="!search.trim() && serverState.selectedCategoryId" class="server-category-label">
                {{ selectedCategoryName }}
              </div>

              <div v-for="catGroup in filteredServers" :key="catGroup.category.id">
                <div v-if="search.trim()" class="server-category-label">{{ catGroup.category.name || "Categoría" }}</div>
                <button 
                   v-for="item in catGroup.items" 
                  :key="item.id"
                  type="button" 
                  class="server-option"
                  :class="{ active: Number(item.id) === Number(serverState.selectedConfigId) }"
                  @click="handleSelect(item.id)"
                >
                  <span>
                    <span class="server-icon-shell">
                      <img v-if="isImageUrl(item.icon)" loading="lazy" :src="item.icon" :alt="item.name || 'Servidor'" />
                      <span v-else class="server-icon-text">{{ item.icon || getInitials(item.name) }}</span>
                    </span>
                    {{ item.name || "Servidor" }}
                    <span
                      v-if="showServerCategoryMeta"
                      class="server-meta"
                    >{{ item.categoryName || "Categoría" }}</span>
                  </span>
                  <span class="ping">{{ getModeLabel(item.mode) }}</span>
                </button>
              </div>
            </template>
            
            <div v-if="filteredServers.length === 0 && serverState.categories.length > 0" class="server-empty">
              Ningún servidor disponible en este momento.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useModals } from "../../composables/useModals";
import { useServers, loadConfigs } from "../../core/store/servers";
import { normalizeSearch, getInitials } from "../../utils/helpers";

const { activeModalId, closeModal } = useModals();
const {
  serverState,
  autoServerMode,
  setAutoServerMode,
  selectServerById,
  setSelectedCategory,
  getModeLabel,
} = useServers();

const search = ref("");

const close = () => {
  closeModal();
};

const refresh = () => {
  loadConfigs();
};

const toggleAutoServer = () => {
  setAutoServerMode(!autoServerMode.value);
};

const handleSelect = (id) => {
  selectServerById(id);
  close();
};

const isImageUrl = (icon) => {
  return /^(data:image\/|https?:\/\/|\/|\.(png|jpe?g|gif|svg|webp|avif))/.test(icon);
};

const filteredServers = computed(() => {
  const query = normalizeSearch(search.value);
  const visibleCategories = [];

  serverState.categories.forEach((category) => {
    const items = category.items.filter((item) => {
      if (!query) return true;
      return [item.name, item.description, item.mode, item.categoryName].some(
        (value) => normalizeSearch(value).indexOf(query) >= 0,
      );
    });
    if (!items.length) return;
    visibleCategories.push({ category, items });
  });

  if (!query && serverState.selectedCategoryId) {
    return visibleCategories.filter(
      ({ category }) => Number(category.id) === Number(serverState.selectedCategoryId)
    );
  }

  return visibleCategories;
});

const showServerCategoryMeta = computed(() => {
  return !!(search.value.trim() || !serverState.selectedCategoryId);
});

const selectedCategoryName = computed(() => {
  const selectedCategory = serverState.categories.find(
    (c) => Number(c.id) === Number(serverState.selectedCategoryId)
  );
  return selectedCategory?.name || "Categoría";
});

watch(search, (value) => {
  if (value && value.trim()) {
    setSelectedCategory(null);
  }
});
</script>

<style scoped>
.server-modal-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.server-tools {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
}

.server-search {
  flex: 1;
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #d8e8ff;
  font-size: 13px;
  border-radius: 10px;
  padding: 8px 10px;
  outline: none;
}

.server-search::placeholder {
  color: rgba(216, 232, 255, 0.62);
}

.server-refresh-btn {
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #d8e8ff;
  font-size: 13px;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  min-width: 84px;
}

.server-empty {
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  padding: 12px 6px;
}

.server-list {
  margin-top: 6px;
  max-height: 44vh;
  overflow: auto;
  padding-right: 2px;
}

.server-option {
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #e8ecff;
  margin-bottom: 8px;
  cursor: pointer;
}

.server-icon-shell {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(216, 232, 255, 0.22);
  color: #e8ecff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.server-icon-shell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.server-icon-text {
  line-height: 1;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.server-option.active {
  border-color: rgba(40, 209, 124, 0.55);
  background: rgba(40, 209, 124, 0.12);
}

.server-category-option {
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #e8ecff;
  margin-bottom: 8px;
  cursor: pointer;
}

.server-category-option .ping {
  font-size: 12px;
  color: #d8e8ff;
  background: rgba(216, 232, 255, 0.12);
  border: 1px solid rgba(216, 232, 255, 0.28);
  padding: 5px 8px;
  border-radius: 999px;
}

.server-back-icon-btn {
  width: auto;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #d8e8ff;
  cursor: pointer;
  margin-bottom: 8px;
  padding: 0 2px;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.server-back-icon-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.server-category-label {
  color: var(--muted);
  font-size: 12px;
  margin: 4px 2px 8px;
}

.server-option .ping {
  font-size: 12px;
  color: var(--yellow);
  background: rgba(248, 200, 77, 0.12);
  border: 1px solid rgba(248, 200, 77, 0.32);
  padding: 5px 8px;
  border-radius: 999px;
}

.server-meta {
  color: var(--muted);
  font-size: 12px;
  margin-left: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
  background: var(--green);
  box-shadow: 0 0 0 4px rgba(40, 209, 124, 0.16);
}

.dot.warn {
  background: var(--yellow);
  box-shadow: 0 0 0 4px rgba(248, 200, 77, 0.16);
}

.dot.danger {
  background: var(--red);
  box-shadow: 0 0 0 4px rgba(255, 94, 125, 0.18);
}

.server-modal-body {
  display: grid;
  gap: 10px;
}

.server-auto-toggle {
  width: 100%;
  border: 1px solid rgba(216, 232, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
  color: #d8e8ff;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.server-auto-text {
  display: grid;
  gap: 1px;
}

.server-auto-text strong {
  font-size: 13px;
  color: #e8ecff;
  line-height: 1.2;
}

.server-auto-text span {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.2;
}

.route-toggle {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.route-toggle::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #dceaff;
  transition: transform 0.2s ease;
}

.route-toggle.active {
  background: rgba(109, 74, 255, 0.45);
  border-color: rgba(139, 110, 255, 0.62);
}

.route-toggle.active::after {
  transform: translateX(16px);
}

.server-auto-note {
  border: 1px solid rgba(133, 185, 255, 0.34);
  background: rgba(95, 155, 255, 0.12);
  color: #d8e8ff;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.45;
}

@media (orientation: landscape) {
  .server-modal {
    max-width: 500px !important;
    bottom: 50% !important;
    left: 50% !important;
    transform: translate(-50%, 50%) !important;
  }

  /* Vue transition classes for landscape */
  .server-modal.modal-enter-from,
  .server-modal.modal-leave-to {
    transform: translate(-50%, 150%) scale(0.97) !important;
    opacity: 0 !important;
  }
}
</style>
