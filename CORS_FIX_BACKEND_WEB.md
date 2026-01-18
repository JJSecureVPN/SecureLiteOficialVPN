# Fix CORS para mostrar “online por servidor”

## Problema observado
El frontend/app hace `fetch` a:
- `https://shop.jhservices.com.ar/api/stats/servidores`

El endpoint responde `200` pero **NO** devuelve `Access-Control-Allow-Origin`.
En navegadores/WebView esto hace que el `fetch` sea bloqueado por CORS, y por eso no aparece el contador de “online”.

Se vio que el endpoint devuelve `Access-Control-Allow-Credentials: true` y `Vary: Origin`, pero falta `Access-Control-Allow-Origin`.

## Objetivo
Para endpoints públicos (`/api/stats/servidores` y opcional `/api/config/promo-status`):
- devolver `Access-Control-Allow-Origin` para orígenes permitidos
- mantener `Access-Control-Allow-Credentials: true` (si se usa)
- responder `OPTIONS` correctamente (preflight)

Importante: en apps que corren como `file://` o ciertos WebView, el Origin puede ser `null`. Si tu app usa `file://`, hay que permitir `Origin: null`.

---

## Opción A — Fix en Node/Express (recomendado)

### 1) Instalar dependencia

```bash
npm i cors
```

### 2) Agregar middleware CORS al inicio (ANTES de las rutas)

```ts
import cors from 'cors';

const allowedOrigins = new Set([
  'null', // importante para file:// / WebView con Origin null
  'https://shop.jhservices.com.ar',
  // agrega aquí tu dominio real del frontend si aplica
]);

app.use(cors({
  origin: (origin, cb) => {
    // origin puede ser undefined (curl/postman). En ese caso, permitir.
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Preflight
app.options('*', cors());
```

### 3) Alternativa “solo endpoints públicos”

```ts
import cors from 'cors';

const publicCors = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin === 'null') return cb(null, true);
    if (origin === 'https://shop.jhservices.com.ar') return cb(null, true);
    return cb(new Error('CORS blocked'));
  },
  credentials: true,
});

app.get('/api/stats/servidores', publicCors, handlerStatsServidores);
app.get('/api/config/promo-status', publicCors, handlerPromoStatus);
```

---

## Opción B — Fix en nginx (si nginx “come” headers)

En el `server {}` correspondiente, dentro del `location /api/ { ... }` (o donde proxy-pass al backend), agregar:

```nginx
add_header 'Access-Control-Allow-Origin' $http_origin always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Allow-Methods' 'GET,POST,PUT,DELETE,OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

if ($request_method = OPTIONS) {
  return 204;
}
```

Nota de seguridad: lo ideal es **whitelist** de orígenes permitidos. `$http_origin` “refleja” cualquier origin.

---

## Verificación rápida (debe mostrar ACAO)

### Chequear con Origin normal

```bash
curl -sSI -H "Origin: https://example.com" https://shop.jhservices.com.ar/api/stats/servidores | head -n 60
```

Deberías ver:
- `Access-Control-Allow-Origin: https://example.com` (o que sea rechazado si no está en whitelist)
- `Access-Control-Allow-Credentials: true`

### Chequear Origin null (file:// / WebView)

```bash
curl -sSI -H "Origin: null" https://shop.jhservices.com.ar/api/stats/servidores | head -n 60
```

Deberías ver:
- `Access-Control-Allow-Origin: null`

---

## Recordatorio
Si usás `credentials: true` en CORS, **no se puede** usar `Access-Control-Allow-Origin: *`. Debe ser un origin específico.
