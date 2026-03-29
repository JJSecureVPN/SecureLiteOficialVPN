<template>
  <div
    class="credentials-modal modal"
    id="credentials-modal"
  >
    <div
      class="credentials-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Credenciales"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            <h3 class="modal-title">Credenciales</h3>
          </div>
        </div>
        <button class="close-btn" type="button" @click="close">Cerrar</button>
      </div>

      <div class="divider"></div>

      <div class="credentials-form">
        <div class="credentials-group" id="username-group" :class="{ hidden: usernameHidden }">
          <label class="credentials-label" for="username-field">Usuario</label>
          <input
            class="credentials-input"
            id="username-field"
            type="text"
            autocomplete="username"
            v-model="username"
            :disabled="disabled"
          />
        </div>
        <div class="credentials-group" id="password-group" :class="{ hidden: passwordHidden }">
          <label class="credentials-label" for="password-field">Contraseña</label>
          <div class="credentials-input-wrap">
            <input
              class="credentials-input"
              id="password-field"
              :type="passwordVisible ? 'text' : 'password'"
              autocomplete="current-password"
              v-model="password"
              :disabled="disabled"
            />
            <button
              class="credentials-toggle"
              type="button"
              id="toggle-password-visibility"
              :aria-label="passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="togglePasswordVisibility"
              :disabled="disabled"
            >
              <span v-html="passwordVisible ? PASSWORD_EYE_OFF_SVG : PASSWORD_EYE_OPEN_SVG" />
            </button>
          </div>
        </div>
        <div class="credentials-group" id="uuid-group" :class="{ hidden: uuidHidden }">
          <label class="credentials-label" for="uuid-field">UUID</label>
          <input
            class="credentials-input"
            id="uuid-field"
            type="text"
            autocomplete="off"
            v-model="uuid"
            :disabled="disabled"
          />
        </div>
      </div>

      <div class="credentials-help">
        <p>Para asegurarte de que el acceso funcione, ingresa tu <strong>usuario</strong> y <strong>contraseña</strong> tal como te los proporcionó tu proveedor de VPN.</p>
        <p>Si no los tenés a mano, revisá el mail de confirmación o contacta a soporte.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useModals } from "../../composables/useModals";
import { useCredentials } from "../../core/store/credentials";
import { useVpn } from "../../core/store/vpn";

const { activeModalId, closeModal } = useModals();
const { username, password, uuid, usernameGroupHidden, passwordGroupHidden, uuidGroupHidden, loadCredentialFields, persistCredentialFields } = useCredentials();
const { isConnected, isConnecting } = useVpn();

const isOpen = computed(() => activeModalId.value === "credentials");
const passwordVisible = ref(false);

const passwordHidden = computed(() => passwordGroupHidden.value);
const usernameHidden = computed(() => usernameGroupHidden.value);
const uuidHidden = computed(() => uuidGroupHidden.value);

const disabled = computed(() => isConnected.value || isConnecting.value);

const close = () => {
  closeModal();
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

watch([username, password, uuid], () => {
  persistCredentialFields();
});

watch(isOpen, (open) => {
  if (open) {
    loadCredentialFields();
  }
});

const PASSWORD_EYE_OPEN_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.1 12a10.8 10.8 0 0 1 19.8 0 10.8 10.8 0 0 1-19.8 0z"/><circle cx="12" cy="12" r="3"/></svg>';
const PASSWORD_EYE_OFF_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3 21 21"/><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4"/><path d="M9.9 5.1A10.8 10.8 0 0 1 21.9 12"/><path d="M6.3 6.3A10.9 10.9 0 0 0 2.1 12a10.8 10.8 0 0 0 14.2 6.6"/></svg>';
</script>

<style scoped>
.credentials-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 16px 14px calc(12px + var(--navigation-offset));
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.credentials-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.credentials-head h3 {
  margin: 0;
  font-size: 16px;
}

.credentials-form {
  display: grid;
  gap: 10px;
}

.credentials-group {
  display: grid;
  gap: 6px;
}

.credentials-group.hidden {
  display: none;
}

.credentials-label {
  font-size: 12px;
  color: var(--muted);
}

.credentials-help {
  margin-top: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
}

.credentials-help p {
  margin: 0 0 8px;
}

.credentials-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credentials-input {
  width: 100%;
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #d8e8ff;
  font-size: 13px;
  border-radius: 10px;
  padding: 9px 10px;
  outline: none;
}

.credentials-toggle {
  border: 1px solid rgba(216, 232, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #d8e8ff;
  font-size: 12px;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  min-width: 46px;
}

.credentials-toggle svg {
  width: 18px;
  height: 18px;
  display: block;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  margin: 0 auto;
}
</style>
