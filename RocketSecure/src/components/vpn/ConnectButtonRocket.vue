<template>
  <div class="connect-core" :class="statusClass">
    <button
      class="connect-trigger"
      aria-label="Conectar VPN"
      id="power-btn"
      :aria-pressed="isConnected.toString()"
      type="button"
      @click="$emit('connect-action')"
    >
      <div id="rocket-host" class="rocket-host" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isConnected: { type: Boolean, default: false },
  status: { type: String, default: "DISCONNECTED" }
});

defineEmits(["connect-action"]);

const statusClass = computed(() => {
  if (props.status === "CONNECTED") return "is-connected";
  if (props.status === "CONNECTING" || props.status === "RECONNECTING" || props.status === "AUTH") return "is-connecting";
  return "";
});
</script>

<style scoped>
.connect-core {
  position: relative;
  width: var(--connect-size, clamp(156px, 26vmin, 205px));
  height: var(--connect-size, clamp(156px, 26vmin, 205px));
  margin: 20px 0 22px;
  display: grid;
  place-items: center;
  isolation: isolate;
}

.rocket-host {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: auto;
  border-radius: 50%;
  border: 0;
  overflow: hidden;
  pointer-events: none;
  background: transparent;
}

.connect-trigger {
  position: relative;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  overflow: hidden;
  transform: translateY(0);
  transition:
    transform 150ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 190ms ease;
}

.connect-trigger::before {
  content: "";
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border-radius: 50%;
  border: 2px solid rgba(139, 110, 255, 0.6);
  pointer-events: none;
  transition: border-color 250ms ease;
}

.connect-trigger:hover {
  transform: translateY(-4px);
  filter: brightness(1.05);
}

.connect-trigger:active {
  transform: translateY(1px) scale(0.985);
}

/* Base Rings */
.connect-core::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid rgba(139, 110, 255, 0.4);
  opacity: 0;
  transform: scale(1);
  pointer-events: none;
  transition: opacity 300ms ease, transform 300ms ease;
  will-change: transform, opacity;
}

.connect-core::after {
  content: "";
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 2px solid rgba(139, 110, 255, 0.42);
  opacity: 0;
  transform: scale(0.94);
  pointer-events: none;
  transition: opacity 300ms ease, transform 300ms ease;
  will-change: transform, opacity;
}

/* Animations Trigger */
.is-connecting .connect-trigger {
  animation: connect-arming 0.72s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.is-connected .connect-trigger {
  filter: none;
}

.is-connected .connect-trigger::before {
  border-color: rgba(139, 110, 255, 0.82);
}

.is-connected .connect-core::before {
  animation: connected-ring-pulse 1.6s ease-out infinite;
}

.is-connected .connect-core::after {
  opacity: 1;
  animation: connected-core-pulse 1.9s ease-out infinite;
}

@keyframes connect-arming {
  0% { transform: scale(1); }
  50% { transform: scale(1.018); }
  100% { transform: scale(1); }
}

@keyframes connected-ring-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  70% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}

@keyframes connected-core-pulse {
  0% { transform: scale(0.94); opacity: 0.48; }
  75% { transform: scale(1.17); opacity: 0; }
  100% { transform: scale(0.94); opacity: 0; }
}

@media (max-height: 760px) {
  :root { --connect-size: clamp(156px, 26vmin, 205px); }
}
@media (max-width: 520px) {
  :root { --connect-size: clamp(148px, 41vw, 192px); }
}
@media (max-width: 900px) and (min-width: 521px) {
  :root { --connect-size: clamp(166px, 29vmin, 220px); }
}
@media (prefers-reduced-motion: reduce) {
  .connect-trigger,
  .rocket-host {
    animation: none !important;
    transition-duration: 80ms !important;
  }
}
@media (max-height: 650px), (max-width: 360px) {
  :root { --connect-size: 135px; }
  .connect-core { margin: 8px 0 12px; }
}
</style>
