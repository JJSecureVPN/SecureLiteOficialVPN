# Import Config — Documentation

📄 **Resumen**

Esta pantalla permite importar una configuración (JSON) para seleccionar un servidor DTunnel local, rellenar credenciales y opcionalmente iniciar la conexión automáticamente. La pantalla está implementada en `src/pages/ImportConfigScreen.tsx` y utiliza estilos en `src/styles/components/import-screen.css`.

## 🚀 Cómo abrir la pantalla

- Menú → **Importar configuración**
- Desde la pantalla Home: botón rápido (QuickButton) con el icono de import

## Flujo de la UI

1. **Input**: pega el JSON en el textarea o arrastra/selecciona un archivo `.json`. (Se intentará parsear automáticamente después de cargar el archivo o al presionar "Continuar").
2. **Select**: si hay varias coincidencias, elige la que quieras configurar.
3. **Confirm**: revisa la configuración y las credenciales.

> ✅ Botón **Aplicar** guarda las credenciales (vía `setCreds`) y selecciona el servidor (`setConfig`). Por diseño, **Aplicar NO inicia la conexión automáticamente** — aunque el JSON incluya un campo `autoConnect`.

## Estructura JSON aceptada (ejemplos)

- By ID (recomendado cuando el proveedor te da el ID):

```json
{
  "id": "123",
  "credentials": {
    "username": "alice",
    "password": "s3cr3t"
  },
  "auto": true
}
```

- By server name / fallback por texto:

```json
{
  "name": "BRASIL - PREMIUM #1",
  "credentials": {
    "user": "bob",
    "pass": "p@ssw0rd"
  }
}
```

- Nested server object (máximo detalle):

```json
{
  "server": {
    "id": 456,
    "name": "ARGENTINA - FAST",
    "host": "ar1.example.net",
    "category": "ARGENTINA"
  },
  "credentials": {
    "username": "carla",
    "password": "pw"
  },
  "autoConnect": true
}
```

- Ejemplo con comentarios (aceptados):

```json
{
  // Datos del servidor que la app va a seleccionar automáticamente
  "server": {
    // Nombre EXACTO del servidor tal como figura en la app
    // Si el nombre no coincide, el servidor no se seleccionará
    "name": "✅[PREMIUM #1] → PRINCIPAL",

    // Categoría o país donde está el servidor
    // Debe coincidir con la categoría existente en la app
    "category": "ARGENTINA"
  },

  // Credenciales de acceso que se cargarán automáticamente
  "credentials": {
    // Usuario asignado al cliente
    "username": "usuario_prueba",

    // Contraseña del usuario
    "password": "secreto123"
  },

  // Conexión automática (NOTA: la app NO iniciará la conexión automáticamente al aplicar)
  "autoConnect": false
}
```

- Host-only match (cuando el nombre no coincide exactamente):

```json
{
  "host": "us1.example.com",
  "auth": {
    "username": "dan",
    "password": "pw"
  }
}
```

> Tip: el parser acepta variantes de nombre de campo comunes (id/serverId, name/server.name, host/hostname, credentials/auth, user/username, pass/password, uuid). Además, el parser ahora **acepta comentarios JavaScript** (// y /\* \*/) dentro del JSON y también elimina **comas finales** (p.ej. { "a": 1, }).

## Heurísticas de búsqueda

- 1. **ID** tiene prioridad — si se encuentra, se elige directamente.
- 2. **Nombre exacto** → búsqueda exacta normalizada (sin acentos, mayúsculas y sin símbolos).
- 3. **Contiene / tokens** → búsqueda por inclusión, token scoring y top-10.
- 4. **Host** → comparaciones sobre host/ip/descripción.
- 5. **Preferencia por categoría** — si el JSON trae `category` o tokens de región (ARGENTINA, BRASIL, USA), se dará preferencia a las coincidencias en esa categoría.

## Seguridad y privacidad

- Las credenciales se almacenan con los mismos mecanismos del app (`setCreds`) y **no** se envían a la red por el proceso de import. Evita compartir archivos JSON con credenciales por canales inseguros.

## Mensajes y errores comunes

- `JSON inválido`: el contenido no es JSON. Revisa comillas y comas.
- `Campo vacío`: no hay contenido para parsear.
- `No se encontró ningún servidor con ese nombre/ID`: intenta con `id` o con tokens del nombre o del `host`.

## Dónde revisar el código

- Pantalla: `src/pages/ImportConfigScreen.tsx` ✅
- Estilos: `src/styles/components/import-screen.css` ✅
- Constantes/UI messages: `src/constants/index.ts` (sección `UI_MESSAGES.import`) ✅

## Ejemplos prácticos - Casos de uso

- Dar soporte a un usuario premium: enviarle un JSON con `server.id` + `credentials` para que lo pegue y haga Apply.
- Crear un archivo `club-invite.json` con `server.name` y `credentials` para llamarlo "configuración de invitación" y distribuirlo offline.

## Troubleshooting rápido

- Si la pantalla no encuentra servidores: recarga las categorías (asegúrate que el app cargó las configs nativas), confirma que `id` corresponde a un servidor local.
- Si el parse no funciona en archivo: abre el `.json` y valide la sintaxis en https://jsonlint.com.

---

Si quieres, puedo:

- Añadir ejemplos CLI para generar JSON automáticamente, o
- Añadir tests unitarios para `parseSync` (recomendado). ✨

¿Quieres que lo coloque también en la raíz `docs/` o lo dejamos en `src/pages`?
