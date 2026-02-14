import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initNativeEvents } from '@/features/vpn';
import { appLogger } from '@/features/logs';
import { initializePerformanceMonitoring } from '../core/utils';

// Small i18n helper for bootstrap path (no React available)
import en from '../i18n/locales/en.json';
import es from '../i18n/locales/es.json';
import pt from '../i18n/locales/pt.json';

function getSystemLang() {
  if (typeof navigator === 'undefined') return 'es';
  const lang = (navigator.language || 'es').split('-')[0].toLowerCase();
  if (lang === 'en') return 'en';
  if (lang === 'pt') return 'pt';
  return 'es';
}

function getNested(obj: any, path: string) {
  return path
    .split('.')
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

function tBootstrap(key: string) {
  const lang = getSystemLang();
  const map: Record<string, any> = { en, es, pt };
  const v = getNested(map[lang], key) ?? getNested(map['es'], key) ?? key;
  return v;
}

import '../styles/variables.css';
import '../styles/animations.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components/buttons.css';
import '../styles/components/cards.css';
import '../styles/components/forms.css';
import '../styles/components/menu.css';
import '../styles/components/chips.css';
import '../styles/components/servers.css';
import '../styles/components/logs.css';
import '../styles/components/applogs.css';
import '../styles/components/toast.css';
import '../styles/components/premium.css';
import '../styles/components/promo-header.css';
import '../styles/components/language-selector.css';

/* News components (refined) */
import '../styles/components/MiniHeader.css';
import '../styles/components/NewsList.css';
import '../styles/components/NewsItem.css';
import '../styles/components/NewsItemSkeleton.css';
import '../styles/components/NewsStates.css';
import '../styles/screens/news.css';

import '../styles/components/error-boundary.css';
import '../styles/components/modal.css';
import '../styles/screens/home.css';
import '../styles/screens/account.css';
import '../styles/screens/terms.css';
import '../styles/responsive.css';

// Inicializar logger de la app
appLogger.add('info', '🚀 Aplicación iniciada');

// Inicializar eventos nativos
initNativeEvents();

// Inicializar monitoreo de performance
initializePerformanceMonitoring();

// Función para renderizar la app con manejo de errores
function renderApp() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    return;
  }

  try {
    const root = createRoot(rootElement);
    const Wrapper = import.meta.env.DEV ? StrictMode : ({ children }: any) => children;
    root.render(
      <Wrapper>
        <App />
      </Wrapper>,
    );
  } catch (error) {
    // Mostrar mensaje de error básico en caso de fallo total
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 20px;
        text-align: center;
        font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        color: var(--text, #1f2937);
        background: linear-gradient(180deg, var(--bg-2, #efeaff), var(--bg-1, #f8f7ff));
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h2 style="margin: 0 0 8px 0;">${tBootstrap('app.loadErrorTitle')}</h2>
        <p style="margin: 0; opacity: 0.7;">${tBootstrap('app.restartPrompt')}</p>
      </div>
    `;
  }
}

// Renderizar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
