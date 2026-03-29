<template>
  <div
    class="offers-modal modal"
    id="offers-modal"
  >
    <div class="offers-sheet" role="dialog" aria-modal="true" aria-label="Ofertas y cupones">

      <div class="drag-handle" aria-hidden="true" />

      <!-- header -->
      <div class="sheet-head">
        <div class="head-badge">
          <span class="badge-dot" aria-hidden="true" />
          {{ badgeLabel }}
        </div>

        <h3 class="head-title">{{ headTitle }}</h3>

        <!-- tabs: solo cuando hay promo Y cupones al mismo tiempo -->
        <div v-if="showTabs" class="head-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'promo' }"
            type="button"
            @click="activeTab = 'promo'"
          >Oferta</button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'coupons' }"
            type="button"
            @click="activeTab = 'coupons'"
          >Cupones</button>
        </div>

        <div class="head-sep" />
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <!-- body -->
      <div class="sheet-body" aria-live="polite">

        <p v-if="loading" class="empty-msg">Cargando novedades...</p>
        <p v-else-if="error" class="empty-msg">No se pudieron cargar las novedades.</p>
        <p v-else-if="!promoActive && activeCoupons.length === 0" class="empty-msg">
          No hay novedades disponibles.
        </p>

        <template v-else>

          <!-- promo: visible si no hay tabs, o si el tab activo es 'promo' -->
          <div v-if="showPromoContent" class="promo-card">
            <div class="promo-top">
              <div>
                <div class="promo-lbl">Oferta especial</div>
                <div class="promo-val">{{ promo?.descuento_porcentaje ?? 0 }}% OFF</div>
              </div>
              <div class="promo-timer">
                <span class="promo-timer-lbl">Finaliza en</span>
                <span class="promo-timer-sep" aria-hidden="true" />
                <span class="promo-timer-val">{{ remainingLabel || 'Tiempo limitado' }}</span>
              </div>
            </div>
            <button class="promo-btn" type="button" @click="openPlanes">Ver planes</button>
          </div>

          <!-- cupones: visibles si no hay tabs, o si el tab activo es 'coupons' -->
          <template v-if="showCouponsContent && activeCoupons.length > 0">
            <span class="coupons-section-lbl">Cupones disponibles</span>
            <div class="coupons-list">
              <button
                v-for="coupon in activeCoupons"
                :key="coupon.id"
                class="coupon-card"
                :class="{ copied: copied[coupon.id] }"
                type="button"
                @click="copyCoupon(coupon.codigo, coupon.id)"
              >
                <div class="coupon-top-row">
                  <span class="coupon-tag">Cupón</span>
                  <span class="coupon-copy-status" :class="{ visible: copied[coupon.id] }">
                    <span class="copied-dot" aria-hidden="true" />
                    Copiado
                  </span>
                </div>
                <div class="coupon-code">{{ coupon.codigo }}</div>
                <div class="coupon-meta">
                  <div class="meta-item">
                    <span class="meta-lbl">Descuento</span>
                    <span class="meta-val accent">
                      {{ coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : `$${coupon.valor}` }}
                    </span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-lbl">Usos restantes</span>
                    <span class="meta-val">{{ remainingUses(coupon) }}</span>
                  </div>
                </div>
                <div class="coupon-hint" :class="{ copied: copied[coupon.id] }">
                  <svg class="hint-icon" viewBox="0 0 16 16" v-if="!copied[coupon.id]">
                    <rect x="2" y="2" width="12" height="12" rx="2"/>
                    <path d="M5 8h6M8 5v6"/>
                  </svg>
                  <svg class="hint-icon hint-check" viewBox="0 0 16 16" v-else>
                    <polyline points="3 8 6.5 11.5 13 5"/>
                  </svg>
                  {{ copied[coupon.id] ? 'Código copiado al portapapeles' : 'Tocar para copiar el código' }}
                </div>
              </button>
            </div>
          </template>

          <p class="sheet-note">
            {{ promoActive && activeCoupons.length === 0
              ? 'Oferta por tiempo limitado.'
              : 'Los cupones se aplican al finalizar la compra.' }}
          </p>

        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useModals }  from '../../composables/useModals'
import { useCoupons } from '../../core/store/coupons'
import { usePromo }   from '../../core/store/promo'
import { sdk }        from '../../core/bridge/sdk'

const PLANES_URL = 'https://shop.jhservices.com.ar/planes'

const { activeModalId, closeModal } = useModals()
const isOpen    = computed(() => activeModalId.value === 'offers')

const { coupons, loading, error, loadCoupons } = useCoupons()
const { promo, isActive: promoActive, remainingLabel, loadPromo } = usePromo()

const activeCoupons = computed(() => coupons.value.filter((c) => c.activo && !c.oculto))
const hasActiveCoupons = computed(() => activeCoupons.value.length > 0)

// ── tabs solo cuando ambos están activos ────────────────────────────────────
const showTabs = computed(() => promoActive.value && hasActiveCoupons.value)

// tab activo: 'promo' | 'coupons' — solo relevante cuando showTabs es true
const activeTab = ref('promo')

// resetear tab al abrirse el modal
watch(isOpen, (open) => {
  if (!open) return
  activeTab.value = 'promo'
  loadCoupons()
  loadPromo()
})

// qué contenido mostrar
const showPromoContent   = computed(() => promoActive.value   && (!showTabs.value || activeTab.value === 'promo'))
const showCouponsContent = computed(() => hasActiveCoupons.value && (!showTabs.value || activeTab.value === 'coupons'))

// ── textos dinámicos del header ─────────────────────────────────────────────
const badgeLabel = computed(() => {
  if (!promoActive.value && !hasActiveCoupons.value) return 'Novedades'
  if (showTabs.value) return activeTab.value === 'promo' ? 'Oferta activa' : `Cupones activos (${activeCoupons.value.length})`
  if (promoActive.value) return 'Oferta activa'
  return `Cupones activos (${activeCoupons.value.length})`
})

const headTitle = computed(() => {
  if (!promoActive.value && !hasActiveCoupons.value) return 'Actualizaciones desde la web'
  if (showTabs.value) return activeTab.value === 'promo'
    ? 'Aprovechá el descuento antes de que termine'
    : 'Tocá un cupón para copiar el código'
  if (promoActive.value) return 'Aprovechá el descuento antes de que termine'
  return 'Tocá un cupón para copiar el código'
})

// ── cupones ─────────────────────────────────────────────────────────────────
const copied = ref({})

const remainingUses = (coupon) => Math.max(0, coupon.limite_uso - coupon.usos_actuales)

const copyCoupon = async (code, id) => {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = { ...copied.value, [id]: true }
    window.setTimeout(() => {
      copied.value = { ...copied.value, [id]: false }
    }, 2500)
  } catch { /* ignore */ }
}

// ── planes ──────────────────────────────────────────────────────────────────
const openPlanes = () => {
  if (sdk?.android?.openExternalUrl) { sdk.android.openExternalUrl(PLANES_URL); return }
  try { window.open(PLANES_URL, '_blank', 'noopener') } catch { /* ignore */ }
}

// ── cerrar ──────────────────────────────────────────────────────────────────
const close = () => closeModal()

const onKeyDown = (e) => { if (e.key === 'Escape') close() }
watch(isOpen, (open) => {
  if (open) window.addEventListener('keydown', onKeyDown)
  else      window.removeEventListener('keydown', onKeyDown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
/* ── Standardized modal container ── */
.offers-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 85vh;
  padding-bottom: calc(12px + var(--navigation-offset, 0px));
}



/* ── drag handle ── */
.drag-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(127, 119, 221, 0.2);
  margin: 12px auto 0;
  flex-shrink: 0;
}

/* ── header ── */
.sheet-head {
  position: relative;
  padding: 12px 16px 0;
  flex-shrink: 0;
}

.head-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--p400, #7F77DD);
  background: rgba(127, 119, 221, 0.09);
  border: 0.5px solid rgba(127, 119, 221, 0.2);
  border-radius: 20px;
  padding: 3px 10px;
  margin-bottom: 8px;
}
.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--p400, #7F77DD);
  flex-shrink: 0;
}

.head-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--t1, #f0eeff);
  line-height: 1.4;
  padding-right: 64px;
  margin-bottom: 12px;
}

.head-tabs {
  display: flex;
  gap: 3px;
  margin-bottom: 12px;
}
.tab-btn {
  background: none;
  border: 0.5px solid transparent;
  border-radius: 7px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 400;
  color: var(--t3, #5e5a73);
  cursor: pointer;
  transition: all .15s;
  letter-spacing: .02em;
}
.tab-btn:hover { color: var(--p400, #7F77DD); border-color: rgba(127, 119, 221, 0.2); }
.tab-btn.active {
  color: var(--p400, #7F77DD);
  background: rgba(127, 119, 221, 0.09);
  border-color: rgba(127, 119, 221, 0.2);
}

.head-sep {
  height: 0.5px;
  background: rgba(127, 119, 221, 0.13);
  margin: 0 -16px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: rgba(127, 119, 221, 0.06);
  border: 0.5px solid rgba(127, 119, 221, 0.15);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 400;
  color: var(--t3, #5e5a73);
  cursor: pointer;
  transition: all .15s;
}
.close-btn:hover { color: var(--t1, #f0eeff); border-color: rgba(127, 119, 221, 0.3); }

/* ── body ── */
.sheet-body {
  padding: 14px 16px 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.empty-msg {
  text-align: center;
  font-size: 13px;
  color: var(--t3, #5e5a73);
  padding: 24px 0;
}

/* ── promo card ── */
.promo-card {
  background: rgba(127, 119, 221, 0.06);
  border: 0.5px solid rgba(127, 119, 221, 0.2);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.promo-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.promo-lbl {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: var(--p400, #7F77DD);
  margin-bottom: 4px;
}
.promo-val {
  font-size: 28px;
  font-weight: 500;
  font-family: var(--mono, 'DM Mono', monospace);
  color: var(--p200, #AFA9EC);
  line-height: 1;
}
.promo-timer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(127, 119, 221, 0.08);
  border: 0.5px solid rgba(127, 119, 221, 0.15);
  border-radius: 8px;
  padding: 6px 10px;
  align-self: flex-start;
  flex-shrink: 0;
}
.promo-timer-lbl {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--p400, #7F77DD);
}
.promo-timer-sep { width: 0.5px; height: 14px; background: rgba(127, 119, 221, 0.2); }
.promo-timer-val {
  font-size: 12px;
  font-weight: 500;
  font-family: var(--mono, 'DM Mono', monospace);
  color: var(--p200, #AFA9EC);
}
.promo-btn {
  background: var(--p400, #7F77DD);
  border: none;
  border-radius: 10px;
  padding: 10px 0;
  width: 100%;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: opacity .15s;
  letter-spacing: .02em;
}
.promo-btn:hover { opacity: .88; }

/* ── coupons ── */
.coupons-section-lbl {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: var(--t3, #5e5a73);
}
.coupons-list { display: flex; flex-direction: column; gap: 8px; }

.coupon-card {
  background: rgba(127, 119, 221, 0.04);
  border: 0.5px solid rgba(127, 119, 221, 0.13);
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  text-align: left;
  width: 100%;
}
.coupon-card:hover {
  border-color: rgba(127, 119, 221, 0.28);
  background: rgba(127, 119, 221, 0.07);
}
.coupon-card.copied {
  border-color: rgba(29, 158, 117, 0.3);
  background: rgba(29, 158, 117, 0.05);
}

.coupon-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.coupon-tag {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--t3, #5e5a73);
}
.coupon-copy-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 500;
  color: #1D9E75;
  opacity: 0;
  transition: opacity .2s;
}
.coupon-copy-status.visible { opacity: 1; }
.copied-dot { width: 4px; height: 4px; border-radius: 50%; background: #1D9E75; }

.coupon-code {
  font-size: 18px;
  font-weight: 500;
  font-family: var(--mono, 'DM Mono', monospace);
  color: var(--t1, #f0eeff);
  letter-spacing: .04em;
  margin-bottom: 8px;
}
.coupon-meta { display: flex; gap: 16px; margin-bottom: 2px; }
.meta-item { display: flex; flex-direction: column; gap: 2px; }
.meta-lbl {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--t3, #5e5a73);
}
.meta-val {
  font-size: 12px;
  font-weight: 500;
  font-family: var(--mono, 'DM Mono', monospace);
  color: var(--t2, #9b96b8);
}
.meta-val.accent { color: var(--p200, #AFA9EC); }

.coupon-hint {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 0.5px solid rgba(127, 119, 221, 0.13);
  font-size: 10px;
  color: var(--t3, #5e5a73);
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color .2s;
}
.coupon-hint.copied { color: #1D9E75; border-top-color: rgba(29, 158, 117, 0.15); }
.hint-icon {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hint-check { stroke: #1D9E75; }

.sheet-note {
  font-size: 10px;
  color: var(--t3, #5e5a73);
  text-align: center;
  line-height: 1.5;
}
</style>