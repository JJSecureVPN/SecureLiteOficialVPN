/**
 * groq.js — Cliente HTTP para la API de Groq
 */

export function groqSend(options, messages, cb) {
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
        const data = JSON.parse(xhr.responseText);
        const ObjectChoices = data.choices || [];
        const reply = ObjectChoices[0]?.message?.content;
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
