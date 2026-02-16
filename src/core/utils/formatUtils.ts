// Utilidades para formateo

export function formatBytes(n: number): string {
  n = +n || 0;
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (n >= GB) return (n / GB).toFixed(2) + ' GB';
  if (n >= MB) return (n / MB).toFixed(2) + ' MB';
  if (n >= KB) return (n / KB).toFixed(2) + ' KB';
  return n + ' B';
}

export function toPingNumber(raw: string | number | null): number {
  if (typeof raw === 'number') return raw;
  const m = String(raw || '').match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : NaN;
}

export function pingClass(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return 'ping--bad';
  if (p <= 200) return 'ping--good';
  if (p <= 500) return 'ping--warn';
  return 'ping--bad';
}

export function formatProtocol(rawMode?: string | null): string {
  const mode = (rawMode || '').trim();
  if (!mode) return '';
  const upper = mode.toUpperCase();
  const base = upper.split('_')[0] || upper;
  switch (base) {
    case 'V2RAY':
      return 'V2Ray';
    case 'SSR':
      return 'SSR';
    case 'SSH':
    case 'SSL':
    case 'UDP':
    case 'TCP':
    case 'HTTP':
    case 'KCP':
      return base;
    default:
      return base.charAt(0) + base.slice(1).toLowerCase();
  }
}

/**
 * Extrae el dominio (Front A, Front B, Cloudflare, G-Cloud) de la descripción.
 * Ahora SOLO retorna el dominio cuando, al removerlo, queda texto adicional. 
 * Esto evita convertir en "badge" descripciones que solo contienen el token.
 * @param description Descripción del servidor
 * @returns El dominio encontrado o null
 */
export function extractDomain(description?: string | null): string | null {
  if (!description) return null;

  const domains = ['Front A', 'Front B', 'Cloudflare', 'G-Cloud'];
  const upper = description.toUpperCase();

  for (const domain of domains) {
    if (!upper.includes(domain.toUpperCase())) continue;

    // Si al quitar el dominio queda texto, tratamos el token como "domain/badge"
    const regex = new RegExp(`\\s*[-•*]?\\s*${domain}\\s*[-•*]?\\s*`, 'gi');
    const cleaned = description.replace(regex, '').trim();
    if (cleaned.length > 0) return domain;
    // Si no queda texto, no lo consideramos dominio (lo mostraremos como descripción)
  }

  return null;
}

/**
 * Remueve el dominio de la descripción solo cuando corresponde (es decir,
 * cuando el dominio aparece junto con texto adicional). Si la descripción
 * es únicamente el token (ej. "Cloudflare") se normaliza y se devuelve el
 * propio token sin signos/puntuación.
 * Además elimina paréntesis vacíos que puedan quedar después de la limpieza.
 * @param description Descripción del servidor
 * @returns Descripción sin el dominio (o la descripción original/normalizada)
 */
export function removeDomainFromDescription(description?: string | null): string {
  if (!description) return '';

  const domains = ['Front A', 'Front B', 'Cloudflare', 'G-Cloud'];
  let result = description.trim();

  for (const domain of domains) {
    const regex = new RegExp(`\\s*[-•*()\\[\\]]?\\s*${domain}\\s*[-•*()\\]\\[]?\\s*`, 'gi');

    const cleaned = result.replace(regex, '').trim();

    if (cleaned.length > 0) {
      // Si queda texto válido, removemos el token y continuamos limpiando
      result = cleaned.replace(/\(\s*\)/g, '').trim();
    } else {
      // El token aparece como único contenido: normalizamos devolviendo solo el token
      const match = result.match(new RegExp(domain, 'i'));
      if (match) {
        result = match[0].trim();
      }
    }
  }

  // Elimina cualquier paréntesis vacíos o caracteres sobrantes generados por la limpieza
  result = result.replace(/\(\s*\)/g, '').trim();

  return result;
}
