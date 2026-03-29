<template>
  <section class="connect-panel" id="connect-panel" :class="connectPanelClass">
    <div class="active-time">
      <span class="label">Conexión activa</span>
      <span class="value" id="active-time-value">{{ activeTime }}</span>
      <button
        class="server-picker-btn"
        type="button"
        id="open-server-modal"
        @click="openServerModal"
      >
        <span class="flag" id="selected-flag">{{ selectedFlag }}</span>
        <span id="selected-location">{{ selectedLocation }}</span>
      </button>
    </div>

    <!-- TV Mode Specific Controls -->
    <div class="tv-controls" v-if="isTvMode">
      <div class="tv-inputs">
        <div class="tv-input-group">
          <label>Usuario</label>
          <input 
            type="text" 
            v-model="username" 
            placeholder="Username" 
            ref="userInput"
            @keydown="handleInputKey"
          />
        </div>
        <div class="tv-input-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Password" 
            ref="passInput"
            @keydown="handleInputKey"
          />
        </div>
      </div>
      
      <TVServerCarousel 
        ref="carouselRef"
        v-if="isTvMode"
        @nav-up="focusInputs"
        @nav-down="focusConnect"
      />
    </div>

    <ConnectButtonRocket 
      :is-connected="isConnected" 
      :status="connectStatus" 
      @connect-action="handleConnectAction" 
    />

    <div class="connect-status" id="connect-status">
      {{ connectStatus }}
    </div>

    <button 
      class="tv-connect-trigger" 
      @click="handleConnectAction" 
      v-if="isTvMode"
      ref="connectBtn"
      @keydown.up.prevent="focusCarousel"
    >
      {{ isConnected ? 'DESCONECTAR' : 'CONECTAR' }}
    </button>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useModals } from "../../composables/useModals";
import { useVpn } from "../../core/store/vpn";
import { useServers } from "../../core/store/servers";
import { useCredentials } from "../../core/store/credentials";
import TVServerCarousel from "./TVServerCarousel.vue";
import ConnectButtonRocket from "./ConnectButtonRocket.vue";

const { openModal } = useModals();
const {
  connectStatus,
  activeTime,
  connectPanelClass,
  isConnected,
  handleConnectAction,
} = useVpn();
const { selectedFlag, selectedLocation } = useServers();
const { username, password } = useCredentials();

const isTvMode = ref(false);
const userInput = ref(null);
const passInput = ref(null);
const carouselRef = ref(null);
const connectBtn = ref(null);

const checkOrientation = () => {
  const isLandscape = window.innerHeight < window.innerWidth;
  if (!isTvMode.value && isLandscape) {
    // Entering TV mode
    setTimeout(() => {
      focusInputs();
    }, 100);
  }
  isTvMode.value = isLandscape;
};

const focusInputs = () => {
  if (userInput.value) userInput.value.focus();
};

const focusCarousel = () => {
  if (carouselRef.value) carouselRef.value.focusFirst();
};

const focusConnect = () => {
  if (connectBtn.value) connectBtn.value.focus();
};

const handleInputKey = (e) => {
  if (e.key === "ArrowRight") {
    if (e.target === userInput.value) passInput.value.focus();
  } else if (e.key === "ArrowLeft") {
    if (e.target === passInput.value) userInput.value.focus();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    focusCarousel();
  }
};


onMounted(() => {
  checkOrientation();
  window.addEventListener("resize", checkOrientation);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkOrientation);
});

const openServerModal = () => {
  openModal("server");
};
</script>

<style scoped>
.connect-panel {
  display: grid;
  place-items: center;
  width: 100%;
  row-gap: 12px;
  margin: 18px 0 18px;
}

.active-time {
  text-align: center;
  margin-bottom: 16px;
}

.active-time .label {
  display: block;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}

.active-time .value {
  display: block;
  font-size: clamp(24px, 6vw, 30px);
  font-weight: 700;
  letter-spacing: 1px;
}

.server-picker-btn {
  margin-top: 8px;
  display: inline-flex;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #d8e8ff;
  background: rgba(109, 74, 255, 0.16);
  border: 1px solid rgba(109, 74, 255, 0.34);
  cursor: pointer;
  transition:
    background 220ms ease,
    border-color 220ms ease,
    transform 220ms ease;
}

.server-picker-btn:hover {
  background: rgba(109, 74, 255, 0.24);
  border-color: rgba(139, 110, 255, 0.42);
}

.server-picker-btn:active {
  transform: scale(0.98);
}

.server-picker-btn:focus-visible {
  outline: 2px solid rgba(167, 139, 255, 0.94);
  outline-offset: 6px;
}

.connect-status {
  margin-top: 10px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}

@media (max-height: 760px) {
  .connect-panel {
    row-gap: 8px;
    margin: 10px 0 12px;
  }
  .active-time {
    margin-bottom: 8px;
  }
  .bottom-zone {
    margin-top: 14px;
  }
}

@media (max-height: 650px), (max-width: 360px) {
  .connect-panel {
    margin: 6px 0;
    row-gap: 6px;
  }
  .active-time {
    margin-bottom: 6px;
  }
  .active-time .value {
    font-size: 22px;
  }
  .server-picker-btn {
    font-size: 11px;
    padding: 5px 10px;
    margin-top: 4px;
    gap: 6px;
  }
  .server-picker-btn .flag {
    font-size: 13px;
  }
  .connect-status {
    margin-top: 6px;
    font-size: 12px;
  }
}
</style>
