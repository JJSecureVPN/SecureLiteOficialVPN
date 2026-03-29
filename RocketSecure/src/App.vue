<template>
  <main class="phone">
    <div class="content">
      <HeaderBar />
      <ConnectPanel />
      <div class="bottom-zone">
        <StatusCard />
      </div>
    </div>

    <BottomTabs />
  </main>

  <ToastHost />

  <ModalOverlay />

  <ModalManager />
</template>

<script setup>
import HeaderBar from "./components/ui/HeaderBar.vue";
import ConnectPanel from "./components/vpn/ConnectPanel.vue";
import StatusCard from "./components/vpn/StatusCard.vue";
import BottomTabs from "./components/ui/BottomTabs.vue";
import ToastHost from "./components/ui/ToastHost.vue";
import ModalOverlay from "./components/ui/ModalOverlay.vue";
import ModalManager from "./components/ModalManager.vue";

// Initialize the app (listeners, sdk events, load defaults) once.
import { useAppInitialization } from "./composables/useAppInitialization";

const { initApp } = useAppInitialization();
initApp();
</script>
