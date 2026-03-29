<template>
  <div
    class="support-modal modal"
    id="support-modal"
  >
    <div
      class="support-sheet modal-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Soporte"
    >
      <div class="modal-glow-border"></div>
      <div class="modal-drag-handle"></div>

      <div class="modal-head">
        <div class="modal-title-group">
          <div class="modal-title-row">
            <span class="modal-header-icon"><svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span>
            <h3 class="modal-title">Soporte Técnico</h3>
          </div>
          <span class="support-subtitle">Asistente Virtual</span>
        </div>
        <div class="support-head-actions">
          <button class="icon-btn" @click="clearHistory" title="Limpiar historial">
            <!-- Trash icon -->
            <svg viewBox="0 0 24 24" class="icon-svg"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
          <button class="close-btn" type="button" @click="close">
            Cerrar
          </button>
        </div>
      </div>
      
      <div class="divider"></div>

      <div class="support-messages" ref="scrollRef">
        <div
          v-for="msg in processedMessages"
          :key="msg.id"
          class="chat-bubble"
          :class="{
            'chat-user': msg.role === 'user',
            'chat-assistant': msg.role === 'assistant',
            'chat-pending': msg.status === 'pending',
            'chat-error': msg.status === 'error'
          }"
        >
          <template v-if="msg.role === 'assistant'">
            <span v-html="renderMarkdown(msg.cleanText)" v-if="msg.cleanText"></span>
            <div class="chat-actions" v-if="msg.links && msg.links.length > 0">
              <a
                v-for="link in msg.links"
                :key="link.url"
                class="chat-link-btn"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ link.label }}
              </a>
            </div>
          </template>
          <template v-else>
            {{ msg.text }}
          </template>
        </div>
      </div>

      <div class="support-footer">
        <input
          type="text"
          class="support-input"
          placeholder="Escribe tu mensaje..."
          v-model="input"
          @keydown.enter="handleSend"
          :disabled="isSending"
        />
        <button
          class="support-send-btn"
          @click="handleSend"
          :disabled="isSending || !input.trim()"
        >
          <!-- Send icon -->
          <svg viewBox="0 0 24 24" class="icon-svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useModals } from '../../composables/useModals';
import { useToasts } from '../../composables/useToasts';
import { groqSend } from '../../core/store/groq';
import { GROQ_API_KEY, GROQ_MODEL, SYSTEM_PROMPT } from '../../core/store/ai-support';

const { activeModalId, closeModal } = useModals();
const { error: toastError } = useToasts();
const isOpen = computed(() => activeModalId.value === 'support');

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const STORAGE_KEY = 'support_chat_history';
const MAX_STORED_MESSAGES = 100;

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveHistory = (msgs) => {
  try {
    const toStore = msgs.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {}
};

const messages = ref(loadHistory());
const input = ref('');
const isSending = ref(false);
const scrollRef = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  });
};

const ALLOWED_ORIGINS = ['shop.jhservices.com.ar', 'wa.me', 't.me'];

const isAllowedUrl = (url) => {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_ORIGINS.some((o) => hostname === o || hostname.endsWith('.' + o));
  } catch {
    return false;
  }
};

const processMessageText = (text) => {
  const links = [];
  const cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    if (isAllowedUrl(url)) {
      links.push({ label, url });
      return '';
    }
    return label;
  }).replace(/\n{2,}/g, '\n').trim();
  return { cleanText, links };
};

const renderMarkdown = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*\*(.+?)\*\*\*/gs, '<strong><em>$1</em></strong>')
    .replace(/___(.+?)___/gs, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
    .replace(/__(.+?)__/gs, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/gs, '<em>$1</em>')
    .replace(/_(.+?)_/gs, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

// Process existing messages so we don't have to re-compute on every render
const processedMessages = computed(() => {
  return messages.value.map(msg => {
    if (msg.role === 'assistant') {
      const { cleanText, links } = processMessageText(msg.text);
      return { ...msg, cleanText, links };
    }
    return msg;
  });
});

watch(isOpen, (newVal) => {
  if (newVal) {
    if (messages.value.length === 0) {
      messages.value.push({
        id: createId(),
        role: 'assistant',
        text: '¡Hola! Soy el soporte de Secure Lite. ¿En qué puedo ayudarte?',
      });
    }
    scrollToBottom();
  }
});

watch(messages, (newMsgs) => {
  saveHistory(newMsgs);
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  // Always ensure at least one message
  if (messages.value.length === 0) {
    messages.value.push({
      id: createId(),
      role: 'assistant',
      text: '¡Hola! Soy el soporte de Secure Lite. ¿En qué puedo ayudarte?',
    });
  }
});

const close = () => {
  closeModal();
};

const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  messages.value = [{
    id: createId(),
    role: 'assistant',
    text: '¡Hola! Soy el soporte de Secure Lite. ¿En qué puedo ayudarte?',
  }];
};

const handleSend = () => {
  const trimmed = input.value.trim();
  if (!trimmed || isSending.value) return;

  if (!GROQ_API_KEY) {
    toastError("No hay API Key configurada para Groq.");
    return;
  }

  const userMessage = { id: createId(), role: 'user', text: trimmed };
  const assistantMessage = {
    id: createId(),
    role: 'assistant',
    text: 'Escribiendo...',
    status: 'pending',
  };

  messages.value.push(userMessage, assistantMessage);
  input.value = '';
  isSending.value = true;

  const payload = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.value.filter(m => m.id !== assistantMessage.id).map(m => ({ role: m.role, content: m.text })),
  ];

  groqSend({ apiKey: GROQ_API_KEY, model: GROQ_MODEL }, payload, {
    onSuccess(reply) {
      const msgTarget = messages.value.find(m => m.id === assistantMessage.id);
      if (msgTarget) {
        msgTarget.text = reply;
        msgTarget.status = undefined;
      }
      isSending.value = false;
    },
    onError(msg) {
      const msgTarget = messages.value.find(m => m.id === assistantMessage.id);
      if (msgTarget) {
        msgTarget.text = msg;
        msgTarget.status = 'error';
      }
      isSending.value = false;
    },
    onTimeout() {
      const msgTarget = messages.value.find(m => m.id === assistantMessage.id);
      if (msgTarget) {
        msgTarget.text = 'Tiempo de espera agotado.';
        msgTarget.status = 'error';
      }
      isSending.value = false;
    }
  });
};
</script>

<style scoped>
.support-modal {
  z-index: 102; /* Above other modals if needed */
  max-height: 90vh;
}

.support-sheet {
  width: 100%;
  max-width: 100%;
  background: linear-gradient(180deg, #1a1a1f 0%, #0d0d10 70%);
  border-radius: 22px 22px 0 0;
  padding: 0;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 85vh;
}

.support-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.support-head-info {
  display: flex;
  flex-direction: column;
}

.support-head h3 {
  margin: 0;
  font-size: 16px;
  color: #e8ecff;
}

.support-subtitle {
  font-size: 11px;
  color: rgba(40, 209, 124, 0.8);
  font-weight: 500;
}

.support-head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #ef4444;
}

.icon-btn .icon-svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.support-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.chat-assistant {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d8e8ff;
  border-bottom-left-radius: 4px;
}

.chat-user {
  align-self: flex-end;
  background: linear-gradient(135deg, rgba(109, 74, 255, 0.2), rgba(139, 110, 255, 0.1));
  border: 1px solid rgba(139, 110, 255, 0.4);
  color: #e8ecff;
  border-bottom-right-radius: 4px;
}

.chat-pending {
  opacity: 0.6;
  animation: pulse 1.5s infinite;
}

.chat-error {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
}

.chat-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.chat-link-btn {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(40, 209, 124, 0.15);
  border: 1px solid rgba(40, 209, 124, 0.3);
  color: #64da9b;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: background 0.2s;
}

.chat-link-btn:active {
  background: rgba(40, 209, 124, 0.25);
}

.support-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 10px;
  background: #151518;
  padding-bottom: calc(12px + var(--navigation-offset, 16px));
}

.support-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(216, 232, 255, 0.15);
  border-radius: 20px;
  padding: 10px 16px;
  color: #e8ecff;
  font-size: 14px;
  outline: none;
}

.support-input:focus {
  border-color: rgba(139, 110, 255, 0.5);
}

.support-send-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #6d4aff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
}

.support-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.support-send-btn .icon-svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  margin-left: -2px;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
</style>
