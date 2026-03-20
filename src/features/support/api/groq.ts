/**
 * groq.ts — Cliente HTTP para la API de Groq (similar a OpenAI Chat Completions).
 *
 * Este módulo no depende de React y puede reusarse desde cualquier proyecto.
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  apiKey: string;
  model: string;
  apiUrl?: string; // default: https://api.groq.com/openai/v1/chat/completions
  maxTokens?: number; // default: 500
  temperature?: number; // default: 0.7
  timeoutMs?: number; // default: 20000
}

export interface GroqCallbacks {
  onSuccess(reply: string): void;
  onError(message: string): void;
  onTimeout(): void;
}

export function groqSend(options: GroqOptions, messages: GroqMessage[], cb: GroqCallbacks): void {
  const url = options.apiUrl ?? 'https://api.groq.com/openai/v1/chat/completions';

  const payload = JSON.stringify({
    model: options.model,
    messages,
    max_tokens: options.maxTokens ?? 500,
    temperature: options.temperature ?? 0.7,
  });

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + options.apiKey);
  xhr.timeout = options.timeoutMs ?? 20000;

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;

    if (xhr.status === 200) {
      try {
        const data = JSON.parse(xhr.responseText) as {
          choices?: Array<{ message: { content: string } }>;
        };
        const reply = data.choices?.[0]?.message?.content;
        reply
          ? cb.onSuccess(reply)
          : cb.onError('No pude procesar la respuesta. Intenta de nuevo.');
      } catch {
        cb.onError('Error al procesar la respuesta. Intenta de nuevo.');
      }
    } else {
      cb.onError('No pude conectarme al soporte ahora. Verifica tu internet.');
    }
  };

  xhr.ontimeout = cb.onTimeout;
  xhr.onerror = () => cb.onError('Error de conexión. Verifica tu internet e intenta de nuevo.');

  xhr.send(payload);
}
