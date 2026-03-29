<template>
  <div
    class="speedtest-modal modal"
    id="speedtest-modal"
  >
    <div
      class="speedtest-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Speedtest"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon"><svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
            <h3 class="modal-title">Speedtest</h3>
          </div>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="speedtest-grid">
        <div class="speedtest-item">
          <div class="label">Download</div>
          <div class="value" id="speedtest-download">{{ speedtestDownload }}</div>
        </div>
        <div class="speedtest-item">
          <div class="label">Upload</div>
          <div class="value" id="speedtest-upload">{{ speedtestUpload }}</div>
        </div>
        <div class="speedtest-item">
          <div class="label">Ping</div>
          <div class="value" id="speedtest-ping">{{ speedtestPing }}</div>
        </div>
        <div class="speedtest-item">
          <div class="label">Jitter</div>
          <div class="value" id="speedtest-jitter">{{ speedtestJitter }}</div>
        </div>
      </div>
      <div class="speedtest-status" id="speedtest-time">
        {{ speedtestTime }}
      </div>
      <div class="speedtest-chart">
        <div class="speedometer">
          <svg viewBox="0 0 320 180" aria-label="Velocímetro de velocidad">
            <defs>
              <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #8b6eff; stop-opacity: 1" />
                <stop offset="50%" style="stop-color: #6da9ff; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #8b6eff; stop-opacity: 1" />
              </linearGradient>
            </defs>
            <!-- Track exterior -->
            <path class="speedometer-track" d="M30 160 A130 130 0 0 1 290 160"></path>
            <!-- Accent interior -->
            <path class="speedometer-accent" d="M48 160 A112 112 0 0 1 272 160"></path>

            <!-- 
              Tick marks y Labels manuales para precisión total
              Centro del arco: (160, 160)
            -->
            <!-- Tick marks en el arco (radio 112) -->
            <line x1="48" y1="160" x2="60" y2="160" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="80.8" y1="80.8" x2="89.2" y2="89.2" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="160" y1="48" x2="160" y2="60" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="239.2" y1="80.8" x2="230.8" y2="89.2" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="272" y1="160" x2="260" y2="160" stroke="rgba(156,182,221,0.55)" stroke-width="1.5" stroke-linecap="round"/>

            <!-- Labels (radio 95 del centro 160,160) -->
            <text x="65"  y="164" text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">0</text>
            <text x="93"  y="97"  text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">25</text>
            <text x="160" y="62"  text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">50</text>
            <text x="227" y="97"  text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">75</text>
            <text x="255" y="164" text-anchor="middle" font-size="10" fill="#9cb6dd" font-weight="600">100</text>
          </svg>

          <div
            class="speedometer-needle"
            id="speedtest-needle"
            :style="{ transform: `translate(-50%, 0) rotate(${speedtestNeedleAngle}deg)` }"
          ></div>
          <div class="speedometer-center"></div>
        </div>

        <div class="speedometer-value" id="speedometer-value">
          {{ speedtestCurrentSpeed }}<span>Mbps</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { useSpeedtest } from "../../core/store/speedtest";

const { activeModalId, closeModal } = useModals();
const {
  speedtestDownload,
  speedtestUpload,
  speedtestPing,
  speedtestJitter,
  speedtestTime,
  runSpeedtest,
  speedtestNeedleAngle,
  speedtestCurrentSpeed,
  speedtestIsRunning,
} = useSpeedtest();

const isOpen = computed(() => activeModalId.value === "speedtest");

const close = () => {
  closeModal();
};

/* Auto-start test when modal opens */
watch(isOpen, (opened) => {
  if (opened) {
    runSpeedtest();
  }
});

</script>

<style scoped>
/* ── Modal container (moved to modals.css) ── */

.speedtest-status {
  text-align: center;
  margin: 0.75rem 0 1rem;
  font-size: 0.9rem;
  color: var(--text-muted, #aab2c8);
}

.speedtest-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.speedtest-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.speedtest-head h3 {
  margin: 0;
  font-size: 16px;
}

.speedtest-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.speedtest-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 8px 9px;
}

.speedtest-item .label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.speedtest-item .value {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 800;
  color: #e8ecff;
}

.speedtest-chart {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(39, 39, 42, 0.62);
  padding: 10px;
  margin-bottom: 10px;
}

.speedometer {
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.speedometer svg {
  width: 100%;
  height: auto;
  display: block;
}

.speedometer-track {
  fill: none;
  stroke: rgba(139, 110, 255, 0.25);
  stroke-width: 12;
  stroke-linecap: round;
}

.speedometer-accent {
  fill: none;
  stroke: #a28eff;
  stroke-width: 6;
  stroke-linecap: round;
  opacity: 0.85;
}

.speedometer-needle {
  position: absolute;
  left: 50%;
  bottom: 18px;
  width: 2px;
  height: 88px;
  background: linear-gradient(180deg, #f8f7ff 0%, #8b6eff 100%);
  border-radius: 999px;
  transform-origin: 50% 100%;
  transform: translate(-50%, 0) rotate(-120deg);
  transition: transform 180ms ease-out;
}

.speedometer-center {
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #f8f7ff;
  box-shadow: 0 0 0 6px rgba(139, 110, 255, 0.22);
  transform: translateX(-50%);
}

.speedometer-scale {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.speedometer-scale span {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: #9cb6dd;
  font-weight: 600;
  line-height: 1;
}

.speedometer-value {
  margin-top: 4px;
  text-align: center;
  font-size: 28px;
  font-weight: 800;
  color: #e8ecff;
  letter-spacing: 0.3px;
}

.speedometer-value span {
  font-size: 12px;
  color: var(--muted);
  margin-left: 6px;
}

.speedtest-sub {
  margin-top: 5px;
  color: var(--muted);
  font-size: 11px;
}

.speedtest-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.speedtest-btn {
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #d8e8ff;
  font-size: 13px;
  border-radius: 10px;
  padding: 8px 11px;
  cursor: pointer;
}

.speedtest-btn.primary {
  border-color: rgba(139, 110, 255, 0.55);
  background: linear-gradient(
    165deg,
    rgba(91, 63, 214, 0.34),
    rgba(55, 36, 137, 0.24)
  );
}
</style>
