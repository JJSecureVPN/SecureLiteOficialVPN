# Integración — Botón “Renovar” (React / WebView)

Breve: la página `https://shop.jhservices.com.ar/planes` ya soporta el parámetro `?cuenta=<username|email>` — al recibirlo cambia automáticamente a la pestaña **Renovación** y busca la cuenta.

---

## URL a usar

- Formato: `https://shop.jhservices.com.ar/planes?cuenta=<usuario_o_email>`
- Ejemplo: `https://shop.jhservices.com.ar/planes?cuenta=jperez%40mail.com`

> El frontend limpia el parámetro `cuenta` después de utilizarlo.

---

## Snippets listos (usa el que corresponda)

### 1) React (web)
```jsx
const goRenovar = (account) => {
  const url = `https://shop.jhservices.com.ar/planes?cuenta=${encodeURIComponent(account)}`;
  window.location.href = url;
};

<button onClick={() => goRenovar(username)}>Renovar</button>
```

Opcional (abrir en nueva pestaña):
```jsx
<a href={`https://shop.jhservices.com.ar/planes?cuenta=${encodeURIComponent(username)}`} target="_blank" rel="noopener noreferrer">Renovar</a>
```

### 2) React Native (abrir navegador)
```js
import { Linking } from 'react-native';

const url = `https://shop.jhservices.com.ar/planes?cuenta=${encodeURIComponent(username)}`;
Linking.openURL(url).catch(err => console.warn('No se pudo abrir URL', err));
```

### 3) React Native WebView (cargar dentro de la app / DTUnnel)
```jsx
// Cargar directamente
const url = `https://shop.jhservices.com.ar/planes?cuenta=${encodeURIComponent(username)}`;
<WebView source={{ uri: url }} />

// O inyectar JS en WebView existente
webviewRef.current?.injectJavaScript(`window.location.href = "${url}"; true;`);
```

---

## Checklist de pruebas ✅
- Abrir: `https://shop.jhservices.com.ar/planes?cuenta=usuario_prueba` → debe cambiar a "Renovación" y buscar.
- Cuenta encontrada → mostrar panel de configuración y proceder al checkout.
- Cuenta no encontrada → ver mensaje de error apropiado.
- Verificar que el parámetro `cuenta` se elimina de la URL tras la búsqueda.

---

## Seguridad y buenas prácticas ⚠️
- Usa solo `username` o `email` en la URL; NUNCA incluyas tokens ni contraseñas.
- Escapa siempre con `encodeURIComponent` / `URLEncoder`.
- Maneja el caso «no encontrada» con un mensaje amigable.

---

## Dónde está la lógica en este repo
- Componente que consume `?cuenta=` y realiza la búsqueda automática:
  `frontend/src/pages/PlanesPage/index.tsx` (useEffect que lee `searchParams.get('cuenta')`).
- Panel de renovación: `frontend/src/pages/PlanesPage/components/RenovacionPanel.tsx`.

---

¿Quieres que cree un pequeño helper/component en `frontend` (ej. `RenovarButton`) y abra un PR con la implementación para DTUnnel/WebView? Si sí, dime en qué componente quieres insertarlo.
