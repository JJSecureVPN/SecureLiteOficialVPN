import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import { groqSend, GroqMessage } from '../../api/groq';
import { GROQ_API_KEY, GROQ_MODEL, SYSTEM_PROMPT } from '../../constants';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { getSdk } from '@/features/vpn/api/dtunnelSdk';
import '@/styles/screens/support-screen.css';

type MessageRole = 'user' | 'assistant';

type Message = {
  id: string;
  role: MessageRole;
  text: string;
  ts: number;
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

function extractLinks(text: string): { cleanText: string; links: MessageLink[] } {
  const links: MessageLink[] = [];
  const cleanText = text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      if (isAllowedUrl(url)) {
        links.push({ label, url });
        return '';
      }
      return label;
    })
    .replace(/\n{2,}/g, '\n')
    .trim();
  return { cleanText, links };
}

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_STORED_MESSAGES)));
  } catch {
    // silent
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// ── Icons ────────────────────────────────────────────────────────────────────

const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12,2a8,8,0,0,0-8,8v1.9A2.92,2.92,0,0,0,3,14a2.88,2.88,0,0,0,1.94,2.61C6.24,19.72,8.85,22,12,22h3V20H12c-2.26,0-4.31-1.7-5.34-4.39l-.21-.55L5.86,15A1,1,0,0,1,5,14a1,1,0,0,1,.5-.86l.5-.29V11a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1v5H13.91a1.5,1.5,0,1,0-1.52,2H20a2,2,0,0,0,2-2V14a2,2,0,0,0-2-2V10A8,8,0,0,0,12,2Z" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="17" height="17">
    <path d="M17 10L3 3l3.5 7L3 17l14-7z" fill="white" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
    <path
      d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

export const SupportScreen = memo(function SupportScreen() {
  const { t } = useTranslation();
  const sectionStyle = useSectionStyle(8, 24);

  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const hasApiKey = Boolean(GROQ_API_KEY);

  const scrollToBottom = useCallback((instant = true) => {
    if (!scrollRef.current) return;

    if (instant) {
      scrollRef.current.scrollTop = 0; // En column-reverse, 0 es el fondo
    } else {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  // Init welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { id: createId(), role: 'assistant', text: t('support.welcome'), ts: Date.now() },
      ]);
    } else {
      saveHistory(messages);
    }
  }, [messages, t]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isSending) return;

      if (!hasApiKey) {
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: 'user', text: trimmed, ts: Date.now() },
          {
            id: createId(),
            role: 'assistant',
            text: t('support.noApiKey'),
            ts: Date.now(),
            status: 'error',
          },
        ]);
        setInput('');
        return;
      }

      const userMessage: Message = {
        id: createId(),
        role: 'user',
        text: trimmed,
        ts: Date.now(),
      };
      const assistantMessage: Message = {
        id: createId(),
        role: 'assistant',
        text: t('support.sending'),
        ts: Date.now(),
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
    },
    [hasApiKey, input, t, isSending],
  );

  const handleOpenLink = useCallback((url: string) => {
    const sdk = getSdk();
    if (sdk) {
      sdk.android.openExternalUrl(url);
      return;
    }
    window.open(url, '_blank');
  }, []);

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      { id: createId(), role: 'assistant', text: t('support.welcome'), ts: Date.now() },
    ]);
  }, [t]);

  const groupedMessages = useMemo(() => {
    return messages.reduce<{ dateLabel: string; msgs: Message[] }[]>((acc, msg) => {
      const label = formatDateLabel(msg.ts);
      const last = acc[acc.length - 1];
      if (last && last.dateLabel === label) {
        last.msgs.push(msg);
      } else {
        acc.push({ dateLabel: label, msgs: [msg] });
      }
      return acc;
    }, []);
  }, [messages]);

  return (
    <section className="screen support-screen" style={sectionStyle}>
      <div className="support-container">
        <div className="support-screen-header">
          <div className="support-screen-header-left">
            <div className="support-header-avatar">
              <BotIcon />
              <span className="support-status-ring" />
            </div>
            <div>
              <h1 className="support-screen-title">{t('support.title')}</h1>
              <p className="support-screen-subtitle">{t('support.subtitle')}</p>
            </div>
          </div>
          <button
            className="support-clear-btn"
            onClick={handleClearHistory}
            title={t('support.clearHistory')}
          >
            <TrashIcon />
          </button>
        </div>

        <div className="support-messages" ref={scrollRef}>
          {groupedMessages
            .slice()
            .reverse() // Última fecha primero (se ve abajo)
            .map(({ dateLabel, msgs }) => (
              <div key={dateLabel}>
                <div className="support-date-label">{dateLabel}</div>
                {msgs.map((message) => {
                  const isBot = message.role === 'assistant';
                  const isPending = message.status === 'pending';
                  const isError = message.status === 'error';

                  if (isBot) {
                    const { cleanText, links } = extractLinks(message.text);
                    return (
                      <div key={message.id} className="support-msg-row support-msg-row--bot">
                        <div className="support-bot-dot">
                          <BotIcon />
                        </div>
                        <div
                          className={[
                            'support-bubble',
                            'support-bubble--bot',
                            isPending && 'support-bubble--pending',
                            isError && 'support-bubble--error',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {isPending ? (
                            <>
                              <span className="support-typing-dot" />
                              <span className="support-typing-dot" />
                              <span className="support-typing-dot" />
                            </>
                          ) : (
                            <>
                              {cleanText && (
                                <span
                                  dangerouslySetInnerHTML={{ __html: renderMarkdown(cleanText) }}
                                />
                              )}
                              {links.length > 0 && (
                                <div className="support-link-actions">
                                  {links.map((link) => (
                                    <button
                                      key={link.url}
                                      type="button"
                                      className="support-link-btn"
                                      onClick={() => handleOpenLink(link.url)}
                                    >
                                      {link.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <span className="support-bubble-time">{formatTime(message.ts)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className="support-msg-row support-msg-row--user">
                      <div
                        className={[
                          'support-bubble',
                          'support-bubble--user',
                          isError && 'support-bubble--error',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {message.text}
                        <span className="support-bubble-time support-bubble-time--user">
                          {formatTime(message.ts)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>

        <form className="support-footer" onSubmit={handleSend}>
          <div className="support-input-wrap" onClick={() => inputRef.current?.focus()}>
            <input
              ref={inputRef}
              className="support-input"
              type="text"
              placeholder={t('support.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={false}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="support-send-btn"
            disabled={isSending || !input.trim()}
            aria-label={t('support.send')}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </section>
  );
});
