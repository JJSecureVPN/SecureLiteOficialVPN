import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import { groqSend, GroqMessage } from '../../features/support/api/groq';
import { GROQ_API_KEY, GROQ_MODEL, SYSTEM_PROMPT } from '../../features/support/constants';
import { BottomSheet } from './BottomSheet';
import '../../styles/components/support-bottom-sheet.css';

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
  <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
    <circle cx="8" cy="8" r="5.5" stroke="#a58eff" strokeWidth="1.3" />
    <path d="M6 8h4M8 6v4" stroke="#a58eff" strokeWidth="1.3" strokeLinecap="round" />
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

interface SupportBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportBottomSheet = memo(function SupportBottomSheet({
  isOpen,
  onClose,
}: SupportBottomSheetProps) {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const hasApiKey = Boolean(GROQ_API_KEY);

  const scrollToBottom = useCallback(() => {
    // Doble rAF: espera que el layout recalcule después del resize del viewport
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    });
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

  // Scroll on new messages or open
  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 350);
    }
  }, [isOpen, scrollToBottom]);

  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isSending) return;

      // Debug log (can be seen in browser console)
      console.log('[Support] Sending message:', trimmed);

      if (!hasApiKey) {
        console.warn('[Support] Missing API Key');
        const errorMsg: Message = {
          id: createId(),
          role: 'assistant',
          text: t('support.noApiKey'),
          ts: Date.now(),
          status: 'error',
        };
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: 'user', text: trimmed, ts: Date.now() },
          errorMsg,
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
          console.error('[Support] Error:', msg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, text: msg, status: 'error' } : m,
            ),
          );
          setIsSending(false);
        },
        onTimeout() {
          console.warn('[Support] Timeout');
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

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      { id: createId(), role: 'assistant', text: t('support.welcome'), ts: Date.now() },
    ]);
  }, [t]);

  // Group messages by date for date labels
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

  const headerIcon = useMemo(
    () => (
      <div className="support-header-avatar">
        <BotIcon />
        <span className="support-status-ring" />
      </div>
    ),
    [],
  );

  const headerActions = useMemo(
    () => (
      <button
        className="support-clear-btn"
        onClick={handleClearHistory}
        title={t('support.clearHistory')}
      >
        <TrashIcon />
      </button>
    ),
    [handleClearHistory, t],
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('support.title')}
      subtitle={t('support.subtitle')}
      className="support-bottom-sheet"
      height="85vh"
      headerActions={headerActions}
      icon={headerIcon}
    >
      <div className="support-container">
        {/* Messages */}
        <div className="support-messages" ref={scrollRef}>
          {groupedMessages.map(({ dateLabel, msgs }) => (
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

          {/* TypingBubble was redundant with isPending message */}
        </div>

        {/* Footer */}
        <form className="support-footer" onSubmit={handleSend}>
          <div className="support-input-wrap">
            <input
              ref={inputRef}
              className="support-input"
              type="text"
              placeholder={t('support.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
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
    </BottomSheet>
  );
});
