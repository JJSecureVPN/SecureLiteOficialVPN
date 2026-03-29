<template>
  <nav class="bottom-tabs" aria-label="Navegación">
    <button class="tab-btn" :class="{ active: activeTab === 'logs' }" type="button" @click="onTabClick('logs')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14M5 10h14M5 15h9M5 19h9" />
      </svg>
      Logs
    </button>

    <button class="tab-btn" :class="{ active: activeTab === 'refresh' }" type="button" @click="onTabClick('refresh')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" />
      </svg>
      Actualizar
    </button>

    <!-- BOTÓN CENTRAL -->
    <div class="center-home-wrapper">
      <button
        class="tab-btn center-home"
        :class="{
          active: activeTab === 'home',
          'deal-active': hasActiveCoupons || promoActive,
        }"
        type="button"
        data-tab="home"
        @click="onCenterClick"
      >
      <template v-if="!(hasActiveCoupons || promoActive)">
        <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10.5 12 3l9 7.5M6.5 9.5V21h11V9.5" />
        </svg>
        <span class="center-label">HOME</span>
      </template>

      <!-- Icono de notificación (campanita) -->
      <span
        v-if="hasActiveCoupons || promoActive"
        class="notif-bell"
        aria-label="Descuento activo"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10 3.17 10 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2h16l-2-2z"/>
        </svg>
      </span>
    </button>
  </div>

    <button class="tab-btn" :class="{ active: activeTab === 'speedtest' }" type="button" @click="onTabClick('speedtest')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 15a8 8 0 0 1 16 0" />
        <path d="M12 14.5l4.5-5.5" />
        <circle cx="7.4" cy="15.5" r="1" />
        <circle cx="12" cy="15.5" r="1" />
        <circle cx="16.6" cy="15.5" r="1" />
      </svg>
      Speedtest
    </button>

    <button class="tab-btn" :class="{ active: activeTab === 'extras' }" type="button" @click="onTabClick('extras')">
      <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Extras
    </button>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { handleUpdateAction } from "../../core/store/extras";
import { runSpeedtest } from "../../core/store/speedtest";
import { useCoupons } from "../../core/store/coupons";
import { usePromo } from "../../core/store/promo";

const { activeModalId, openModal } = useModals();
const { coupons } = useCoupons();
const { isActive: promoActive } = usePromo();

const activeTab = ref("home");

// Reset tab when modal closes
watch(activeModalId, (id) => {
  if (!id) activeTab.value = "home";
});

const hasActiveCoupons = computed(() =>
  coupons.value.some((c) => c.activo && !c.oculto)
);

const onTabClick = (tab) => {
  activeTab.value = tab;
  if (tab === "logs") { openModal("logs"); return; }
  if (tab === "refresh") { handleUpdateAction(); return; }
  if (tab === "speedtest") { openModal("speedtest"); runSpeedtest(); return; }
  if (tab === "extras") { openModal("extras"); return; }
};

const onCenterClick = () => {
  activeTab.value = "home";
  openModal("offers");
};
</script>

<style scoped>
/* Wrapper que eleva el botón por encima del borde del nav */
.center-home-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: -6px; /* lo sube por encima del borde superior del bottom bar */
}

/* Botón central base */
.center-home {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-background-primary);
  border: 2px solid var(--color-border-secondary);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transform: translateY(-10px); /* lo sube sobre el borde del nav */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.center-home:active {
  transform: translateY(-8px) scale(0.96);
}

/* Estado con descuento/cupón activo */
@keyframes pulse {
  0%, 100% {
    box-shadow:
      0 -2px 12px rgba(212, 144, 10, 0.4),
      0 0 0 1px rgba(212, 144, 10, 0.3);
  }
  50% {
    box-shadow:
      0 -2px 16px rgba(212, 144, 10, 0.55),
      0 0 0 2px rgba(212, 144, 10, 0.45);
  }
}

@keyframes pulseDot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.75;
  }
}

.center-home.deal-active {
  background: #1a1200;
  border-color: #d4900a;
  box-shadow:
    0 -2px 12px rgba(212, 144, 10, 0.4),
    0 0 0 1px rgba(212, 144, 10, 0.3);
  transform: translateY(-14px); /* un poco más arriba cuando hay oferta */
  animation: pulse 2s ease-in-out infinite;
}

.center-home.deal-active .icon-svg {
  stroke: #f5c842;
}

.center-home.deal-active .center-label {
  color: #f5c842;
}

/* Icono de notificación (campanita) */
.notif-bell {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #f5c842;
  animation: pulseDot 1.4s ease-in-out infinite;
  pointer-events: none;
}

.notif-bell svg {
  width: 25px;
  height: 25px;
  fill: currentColor;
}

/* Label debajo del icono */
.center-label {
  font-size: 9px;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  line-height: 1;
}
</style>