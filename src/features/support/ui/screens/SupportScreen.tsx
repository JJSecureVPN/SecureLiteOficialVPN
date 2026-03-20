import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useVpn } from '@/features/vpn';
import { useToastContext } from '@/shared/context/ToastContext';
import { Button, Input } from '@/shared/ui';
import { useSafeArea } from '@/shared/hooks/useSafeArea';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useTranslation } from '@/i18n';
import { groqSend, GroqMessage } from '../../api/groq';
import { GROQ_API_KEY, GROQ_MODEL, SYSTEM_PROMPT } from '../../constants';

type MessageRole = 'user' | 'assistant';

type Message = {
  id: string;
  role: MessageRole;
  text: string;
  status?: 'pending' | 'error';
};

const createId = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ALLOWED_ORIGINS = ['shop.jhservices.com.ar', 'wa.me'];

function isAllowedUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_ORIGINS.some((o) => hostname === o || hostname.endsWith('.' + o));
  } catch {
    return false;
  }
}

type MessageLink = { label: string; url: string };

/** Extrae los links Markdown del texto y devuelve el texto limpio + los links aparte */
function extractLinks(text: string): { cleanText: string; links: MessageLink[] } {
  const links: MessageLink[] = [];
  const cleanText = text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      if (isAllowedUrl(url)) {
        links.push({ label, url });
        return ''; // eliminar del texto
      }
      return label; // si no está en lista blanca, dejar solo el label
    })
    .replace(/\n{2,}/g, '\n')
    .trim();
  return { cleanText, links };
}

/** Convierte markdown básico a HTML seguro (escape-first para prevenir XSS) */
function renderMarkdown(text: string): string {
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
}

const STORAGE_KEY = 'support_chat_history';
const MAX_STORED_MESSAGES = 100;

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: Message[]) {
  try {
    const toStore = msgs.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // silent — storage lleno
  }
}

export const SupportScreen = memo(function SupportScreen() {
  const { setScreen } = useVpn();
  const { showToast } = useToastContext();
  const { t } = useTranslation();
  const sectionStyle = useSectionStyle();
  const { navigationBarHeight } = useSafeArea();
  const footerSpacing = navigationBarHeight + 10; // espacio para que el footer no quede bajo la barra de navegación

  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const hasApiKey = Boolean(GROQ_API_KEY);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: createId(), role: 'assistant', text: t('support.welcome') }]);
    } else {
      saveHistory(messages);
    }
  }, [messages, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    if (!hasApiKey) {
      showToast(t('support.noApiKey'), null, 'error');
      return;
    }

    const userMessage: Message = { id: createId(), role: 'user', text: trimmed };
    const assistantMessage: Message = {
      id: createId(),
      role: 'assistant',
      text: t('support.sending'),
      status: 'pending',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsSending(true);

    const payload: GroqMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messagesRef.current.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user', content: trimmed },
    ];

    groqSend({ apiKey: GROQ_API_KEY, model: GROQ_MODEL }, payload, {
      onSuccess(reply) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, text: reply, status: undefined } : m,
          ),
        );
        setIsSending(false);
      },
      onError(msg) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, text: msg, status: 'error' } : m,
          ),
        );
        setIsSending(false);
      },
      onTimeout() {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, text: t('support.timeout'), status: 'error' }
              : m,
          ),
        );
        setIsSending(false);
      },
    });
  }, [hasApiKey, input, showToast, t, isSending]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{ id: createId(), role: 'assistant', text: t('support.welcome') }]);
  }, [t]);

  return (
    <section
      className="screen support-screen"
      style={{
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: footerSpacing,
      }}
    >
      {/* Header */}
      <div className="support-screen__header">
        <button
          className="support-screen__back-btn"
          onClick={() => setScreen('menu')}
          aria-label={t('common.back')}
        >
          ←
        </button>
        <div className="support-screen__header-info">
          <span className="support-screen__title">{t('support.title')}</span>
          <span className="support-screen__subtitle">{t('support.subtitle')}</span>
        </div>
        <button
          className="support-screen__clear-btn"
          onClick={handleClearHistory}
          aria-label={t('support.clearHistory')}
          title={t('support.clearHistory')}
        >
          <i className="fa fa-trash" aria-hidden="true" />
        </button>
        <span className="support-screen__status-dot" aria-hidden="true" />
      </div>

      {/* Messages — this area scrolls */}
      <div className="support-screen__messages" ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={[
              'support-screen__bubble',
              `support-screen__bubble--${message.role}`,
              message.status === 'pending' && 'support-screen__bubble--pending',
              message.status === 'error' && 'support-screen__bubble--error',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {message.role === 'assistant'
              ? (() => {
                  const { cleanText, links } = extractLinks(message.text);
                  return (
                    <>
                      {cleanText && (
                        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(cleanText) }} />
                      )}
                      {links.length > 0 && (
                        <div className="support-screen__bubble-actions">
                          {links.map((link) => (
                            <a
                              key={link.url}
                              className="support-link-btn"
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()
              : message.text}
          </div>
        ))}
      </div>

      {/* Footer — always fixed at the bottom */}
      <div className="support-screen__footer">
        <Input
          className="support-screen__input"
          placeholder={t('support.placeholder')}
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <Button
          className="support-screen__send-btn"
          variant="primary"
          onClick={handleSend}
          disabled={isSending || !input.trim()}
          aria-label={t('support.send')}
        >
          {t('support.send')}
        </Button>
      </div>
    </section>
  );
});
