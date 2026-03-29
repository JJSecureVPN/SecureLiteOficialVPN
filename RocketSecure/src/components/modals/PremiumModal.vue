<template>
  <div
    class="premium-modal modal"
    id="premium-modal"
  >
    <div
      class="premium-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Planes Premium"
    >
      <div class="drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="premium-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            Premium
          </div>
          <h3 class="modal-title">Planes Premium</h3>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="modal-body">
        <div class="plans-grid">
          <button
            class="plan-card primary"
            type="button"
            @click="openExternal('https://shop.jhservices.com.ar/planes')"
          >
            <span class="plan-label">Uso personal</span>
            <span class="plan-name">Planes VPN</span>
            <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <button
            class="plan-card secondary"
            type="button"
            @click="openExternal('https://shop.jhservices.com.ar/revendedores')"
          >
            <span class="plan-label">Para negocios</span>
            <span class="plan-name">Revender</span>
            <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <p class="modal-note">
          Serás redirigido a nuestro sitio para completar la compra.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useModals } from "../../composables/useModals";
import { sdk } from "../../core/bridge/sdk";

const { closeModal } = useModals();

const close = () => closeModal();

const openExternal = (url) => {
  if (sdk?.android?.openExternalUrl) {
    sdk.android.openExternalUrl(url);
    return;
  }
  window.open(url, "_blank", "noopener");
};
</script>

<style scoped>
/* ── Modal wrapper (standardized) ── */

/* ── Sheet ── */
.premium-sheet {
  width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  border-top: 0.5px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
  padding: 0 0 calc(12px + var(--navigation-offset, 0px));
  overflow: hidden;
}

/* ── Drag handle ── */
.drag-handle {
  width: 36px;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 99px;
  margin: 14px auto 0;
}

/* ── Head ── */
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 18px 0;
}

.modal-title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8b6eff;
}

.premium-badge svg {
  width: 10px;
  height: 10px;
  fill: #8b6eff;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #e8ecff;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* ── Close button ── */
.close-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
  letter-spacing: 0.06em;
  padding: 6px 14px;
  border-radius: 99px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}

/* ── Divider ── */
.divider {
  height: 0.5px;
  background: rgba(255, 255, 255, 0.07);
  margin: 18px 18px;
}

/* ── Body ── */
.modal-body {
  padding: 0 18px 12px;
}

/* ── Plans grid ── */
.plans-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}

/* ── Plan cards ── */
.plan-card {
  position: relative;
  padding: 18px 14px;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: background 0.2s;
  font-family: inherit;
}

.plan-card.primary {
  background: rgba(139, 110, 255, 0.15);
  border: 1px solid rgba(139, 110, 255, 0.3);
}

.plan-card.primary:hover {
  background: rgba(139, 110, 255, 0.22);
}

.plan-card.secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.plan-card.secondary:hover {
  background: rgba(255, 255, 255, 0.06);
}

.plan-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.plan-card.primary .plan-label { color: rgba(139, 110, 255, 0.7); }
.plan-card.secondary .plan-label { color: rgba(255, 255, 255, 0.28); }

.plan-name {
  font-size: 15px;
  font-weight: 800;
  color: #e8ecff;
  letter-spacing: -0.01em;
}

.arrow {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 13px;
  height: 13px;
}

.plan-card.primary .arrow { color: rgba(139, 110, 255, 0.5); }
.plan-card.secondary .arrow { color: rgba(255, 255, 255, 0.2); }

/* ── Note ── */
.modal-note {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.22);
  line-height: 1.6;
  letter-spacing: 0.01em;
}
</style>