<template>
  <Transition name="modal">
    <component
      v-if="activeModalId"
      :is="activeModalComponent"
      :key="activeModalId"
    />
  </Transition>
</template>

<script setup>
import { computed } from "vue";
import { useModals } from "../composables/useModals";

// Import all modals
import ServerModal from "./modals/ServerModal.vue";
import LogsModal from "./modals/LogsModal.vue";
import AutoConnectModal from "./modals/AutoConnectModal.vue";
import AutoAuthErrorModal from "./modals/AutoAuthErrorModal.vue";
import CredentialsModal from "./modals/CredentialsModal.vue";
import CheckuserModal from "./modals/CheckuserModal.vue";
import ExtrasModal from "./modals/ExtrasModal.vue";
import HotspotModal from "./modals/HotspotModal.vue";
import ConfirmModal from "./modals/ConfirmModal.vue";
import SpeedtestModal from "./modals/SpeedtestModal.vue";
import AISupportModal from "./modals/AISupportModal.vue";
import PremiumModal from "./modals/PremiumModal.vue";
import OffersModal from "./modals/OffersModal.vue";

const { activeModalId } = useModals();

const modalMap = {
  server: ServerModal,
  logs: LogsModal,
  "auto-connect": AutoConnectModal,
  "auto-auth-error": AutoAuthErrorModal,
  credentials: CredentialsModal,
  checkuser: CheckuserModal,
  extras: ExtrasModal,
  hotspot: HotspotModal,
  confirm: ConfirmModal,
  speedtest: SpeedtestModal,
  support: AISupportModal,
  premium: PremiumModal,
  offers: OffersModal,
};

const activeModalComponent = computed(() => {
  return modalMap[activeModalId.value] || null;
});
</script>
