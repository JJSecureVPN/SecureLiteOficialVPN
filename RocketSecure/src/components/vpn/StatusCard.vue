<template>
  <section class="status-card">

    <!-- header — siempre 40px -->
    <div class="sc-head">
      <span class="sc-label">{{ headLabel }}</span>

      <div class="nav-tabs">
        <button
          class="tab-btn"
          :class="{ active: view === 'preconnect' }"
          type="button"
          @click="view = 'preconnect'"
        >Red</button>
        <button
          class="tab-btn"
          :class="{ active: view === 'traffic' }"
          type="button"
          @click="view = 'traffic'"
        >Tráfico</button>
        <button
          class="tab-btn"
          :class="{ active: view === 'stats' }"
          type="button"
          @click="view = 'stats'"
        >Stats</button>
      </div>
    </div>


    <!-- grid 2×2 — siempre 4 celdas de 52px -->
    <div class="sc-grid-container">
      <Transition name="tab-fade" mode="out-in">
        <div :key="view" class="sc-grid">
          <template v-if="view === 'preconnect'">
            <div class="sc-cell">
              <span class="lbl">IP local</span>
              <span class="val">{{ localIp }}</span>
            </div>
            <div class="sc-cell">
              <span class="lbl">Red</span>
              <span class="val">{{ networkName }}</span>
            </div>
            <div class="sc-cell">
              <span class="lbl">Configuración</span>
              <span class="val accent">{{ configVersion }}</span>
            </div>
            <div class="sc-cell">
              <span class="lbl">App</span>
              <span class="val accent">{{ appVersion }}</span>
            </div>
          </template>

          <template v-else-if="view === 'traffic'">
            <div class="sc-cell speed">
              <div class="ico ico-down">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 4v16M6 14l6 6 6-6"/>
                </svg>
              </div>
              <div class="speed-inner">
                <span class="lbl">Descarga</span>
                <span class="val green">{{ download }}</span>
              </div>
            </div>
            <div class="sc-cell speed">
              <div class="ico ico-up">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20V4M6 10l6-6 6 6"/>
                </svg>
              </div>
              <div class="speed-inner">
                <span class="lbl">Subida</span>
                <span class="val accent">{{ upload }}</span>
              </div>
            </div>
            <div class="sc-cell speed">
              <div class="ico ico-ping">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </div>
              <div class="speed-inner">
                <span class="lbl">Ping</span>
                <span class="val amber">{{ ping }}</span>
              </div>
            </div>
            <div class="sc-cell">
              <span class="lbl">Tráfico total</span>
              <span class="val accent">{{ totalUsed }}</span>
            </div>
          </template>

          <template v-else-if="view === 'stats'">
            <div class="sc-cell">
              <span class="lbl">Usuarios</span>
              <span v-if="showLoading" class="val skeleton skeleton-text" />
              <span v-else class="val accent">
                {{ totalUsers != null ? totalUsers.toLocaleString() : '—' }}
              </span>
              <div v-if="showLoading" class="bar-wrap skeleton" />
              <div v-else class="bar-wrap"><div class="bar bar-purple" :style="{ width: userBarWidth + '%' }" /></div>
            </div>
            <div class="sc-cell">
              <span class="lbl">CPU promedio</span>
              <span v-if="showLoading" class="val skeleton skeleton-text" />
              <span v-else class="val">
                {{ cpuAverage != null ? `${cpuAverage}%` : '—' }}
              </span>
              <div v-if="showLoading" class="bar-wrap skeleton" />
              <div v-else class="bar-wrap"><div class="bar bar-purple" :style="{ width: (cpuAverage ?? 0) + '%' }" /></div>
            </div>
            <div class="sc-cell">
              <span class="lbl">RAM promedio</span>
              <span v-if="showLoading" class="val skeleton skeleton-text" />
              <span v-else class="val">
                {{ memoryAverage != null ? `${memoryAverage}%` : '—' }}
              </span>
              <div v-if="showLoading" class="bar-wrap skeleton" />
              <div v-else class="bar-wrap"><div class="bar bar-amber" :style="{ width: (memoryAverage ?? 0) + '%' }" /></div>
            </div>
            <div class="sc-cell">
              <span class="lbl">Servidores online</span>
              <span v-if="showLoading" class="val skeleton skeleton-text" />
              <span v-else class="val green">
                {{ onlineServers != null ? `${onlineServers} online` : '—' }}
              </span>
            </div>
          </template>
        </div>
      </Transition>
    </div>

    <!-- footer — siempre 36px -->
    <div class="sc-foot-container">
      <Transition name="tab-fade" mode="out-in">
        <div :key="view" class="sc-foot">
          <template v-if="view === 'preconnect'">
            <div class="sc-foot-cell">
              <span class="foot-lbl">Estado</span>
              <span class="foot-val">Desconectado</span>
            </div>
            <div class="sc-foot-cell">
              <span class="foot-lbl">Servidor</span>
              <span class="foot-val">—</span>
            </div>
          </template>

          <template v-else-if="view === 'traffic'">
            <div class="sc-foot-cell">
              <span class="foot-lbl">Descarga acum.</span>
              <span class="foot-val">{{ totalDown }}</span>
            </div>
            <div class="sc-foot-cell">
              <span class="foot-lbl">Subida acum.</span>
              <span class="foot-val">{{ totalUp }}</span>
            </div>
          </template>

          <template v-else-if="view === 'stats'">
            <div class="sc-foot-cell">
              <span class="foot-lbl">Región</span>
              <span v-if="showLoading" class="foot-val skeleton skeleton-bar" />
              <span v-else class="foot-val">{{ serverRegion ?? '—' }}</span>
            </div>
            <div class="sc-foot-cell">
              <span class="foot-lbl">Latencia</span>
              <span v-if="showLoading" class="foot-val skeleton skeleton-bar" />
              <span v-else class="foot-val online">{{ ping }}</span>
            </div>
          </template>
        </div>
      </Transition>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRuntime } from '../../core/store/runtime'
import { useVpn } from '../../core/store/vpn'
import { useServerStats } from '../../core/store/server-stats'
import { safeStorageGet, safeStorageSet } from '../../composables/useStorage'
import { STORAGE_KEYS } from '../../constants/storage-keys'

const {
  localIp, networkName, configVersion, appVersion,
  download, upload, ping, totalDown, totalUp, totalUsed,
} = useRuntime()

const { isConnected } = useVpn()

// ── view persistence ────────────────────────────────────────────────────────
const VALID_VIEWS  = ['preconnect', 'traffic', 'stats']

const storedView  = safeStorageGet(STORAGE_KEYS.statusView)
const initialView =
  storedView && VALID_VIEWS.includes(storedView)
    ? storedView
    : 'preconnect'

const view = ref(initialView)

// Al conectar VPN, auto-cambiar a vista de tráfico
watch(isConnected, (connected) => {
  if (connected) view.value = 'traffic'
})

watch(view, (val) => {
  safeStorageSet(STORAGE_KEYS.statusView, val)
})

// ── server stats ────────────────────────────────────────────────────────────
const { totalUsers, onlineServers, cpuAverage, memoryAverage, serverRegion, loading } =
  useServerStats({
    pollMs:  5000,
    enabled: computed(() => view.value === 'stats'),
  })

const showLoading = computed(() => loading.value && totalUsers.value == null)

// ── mini bar width ──────────────────────────────────────────────────────────
const userBarWidth = computed(() =>
  totalUsers.value != null ? Math.min(Math.round(totalUsers.value / 20), 100) : 0
)

// ── header label ────────────────────────────────────────────────────────────
const headLabel = computed(() => {
  if (view.value === 'preconnect') return 'Detalles de conexión'
  if (view.value === 'traffic')    return 'Tráfico en vivo'
  return 'Servidor'
})

</script>

<style scoped>
/* ── card shell ── */
.status-card {
  background: var(--card, #17151f);
  border: 0.5px solid rgba(127, 119, 221, 0.13);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── header — 40px ── */
.sc-head {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 0.5px solid rgba(127, 119, 221, 0.13);
  flex-shrink: 0;
}

.sc-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--t3, #5e5a73);
}

.nav-tabs { display: flex; gap: 3px; }

.tab-btn {
  background: none;
  border: 0.5px solid transparent;
  border-radius: 7px;
  padding: 3px 9px;
  font-size: 10px;
  font-weight: 400;
  color: var(--t3, #5e5a73);
  cursor: pointer;
  transition: color .15s, background .15s, border-color .15s;
  letter-spacing: .02em;
}
.tab-btn:hover:not(:disabled) {
  color: var(--p400, #7F77DD);
  border-color: rgba(127, 119, 221, 0.2);
}
.tab-btn.active {
  color: var(--p400, #7F77DD);
  background: rgba(127, 119, 221, 0.09);
  border-color: rgba(127, 119, 221, 0.2);
}
.tab-btn:disabled { opacity: .3; cursor: default; }

/* ── status strip — 30px ── */

/* ── grid 2×2 — celdas de 52px ── */
.sc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 52px 52px;
  flex: 1;
}

.sc-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 3px;
  padding: 0 10px;
  border-right: 0.5px solid rgba(127, 119, 221, 0.13);
  border-bottom: 0.5px solid rgba(127, 119, 221, 0.13);
}
.sc-cell:nth-child(even)      { border-right: none; }
.sc-cell:nth-last-child(-n+2) { border-bottom: none; }

.lbl {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: var(--t3, #5e5a73);
}

.val {
  font-size: 14px;
  font-weight: 500;
  font-family: var(--mono, 'DM Mono', monospace);
  color: var(--t1, #f0eeff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.val.accent { color: var(--p200, #AFA9EC); }
.val.green  { color: #5DCAA5; }
.val.amber  { color: #EF9F27; }

/* mini progress bar */
.bar-wrap {
  width: 56px;
  height: 2px;
  background: rgba(127, 119, 221, 0.13);
  border-radius: 1px;
  overflow: hidden;
}
.bar {
  height: 100%;
  border-radius: 1px;
  transition: width .5s ease;
}
.bar-purple { background: var(--p400, #7F77DD); }
.bar-green  { background: #1D9E75; }
.bar-amber  { background: #EF9F27; }

/* ── speed cells ── */
.sc-cell.speed {
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  padding: 0 8px;
}

.ico {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ico-down { background: rgba(29, 158, 117, 0.12); }
.ico-up   { background: rgba(127, 119, 221, 0.12); }
.ico-ping { background: rgba(186, 117, 23, 0.12); }

.ico svg { width: 11px; height: 11px; }
.ico-down svg { stroke: #1D9E75; }
.ico-up   svg { stroke: var(--p400, #7F77DD); }
.ico-ping svg { stroke: #BA7517; }

.speed-inner {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}
.speed-inner .lbl { text-align: left; }

/* ── footer — 36px ── */
.sc-foot {
  height: 36px;
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  border-top: 0.5px solid rgba(127, 119, 221, 0.13);
}

.sc-foot-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 10px;
  gap: 1px;
}
.sc-foot-cell + .sc-foot-cell {
  border-left: 0.5px solid rgba(127, 119, 221, 0.13);
}

.foot-lbl {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--t3, #5e5a73);
}
.foot-val {
  font-size: 11px;
  font-weight: 500;
  font-family: var(--mono, 'DM Mono', monospace);
  color: var(--t2, #9b96b8);
}
.foot-val.online { color: #1D9E75; }
/* ── Transitions ── */
.sc-grid-container, .sc-foot-container {
  overflow: hidden;
  position: relative;
}

.tab-fade-enter-active, .tab-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>