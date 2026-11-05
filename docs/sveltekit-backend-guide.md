**File:** `docs/sveltekit-instrumentation.md`

---  

# Instrumentación del Backend de S​velteKit con Highlight  

Este documento describe, paso a paso, cómo habilitar la captura automática de trazas, errores y eventos en el **backend** de una aplicación SvelteKit usando **Highlight**.  
Todo el proceso está pensado para proyectos que ya usan Highlight en el frontend y que desean una visión completa del stack.

> **⚠️ Requisitos** – Esta guía asume que tu proyecto está basado en SvelteKit ≥ 1.0 y que utilizas **TypeScript** (aunque la mayor parte del código también funciona en JavaScript puro).  

---

## 1. Visión general  

| Concepto | Qué hace Highlight | Por qué es útil en SvelteKit |
|----------|-------------------|------------------------------|
| **Tracing** | Crea spans y los enlaza a la request ID de Highlight. | Permite visualizar la ruta completa de la request (frontend → backend) y el tiempo que cada handler tarda. |
| **Error monitoring** | Captura excepciones no manejadas y errores explícitos (`highlight.error`). | Los fallos en endpoints `+server.ts` aparecen junto a los errores del cliente, facilitando la correlación. |
| **Custom events** | `highlight.track(eventName, payload)`. | Puedes registrar métricas de negocio (p.ej. “order_completed”) directamente desde el servidor. |
| **Session linking** | Usa la cookie `hl_session_id` para asociar la request del servidor con la sesión del usuario. | Da una vista única del journey del usuario a través de la aplicación. |

---

## 2. Requisitos previos & instalación  

### 2.1 Dependencias

```bash 
# Core Highlight SDK para Node (compatible con SvelteKit)
npm i @highlight-run/node

# (Opcional) Si usas Vite/ESM y deseas que la SDK se inyecte antes que cualquier otro import
npm i highlight-run
```

> **Nota:** La SDK de Node exporta una única instancia `Highlight`. No se necesita instalar `@highlight-run/browser`.

### 2.2 Variables de entorno  

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_HIGHLIGHT_PROJECT` | **Obligatoria** – ID del proyecto Highlight. | `12345` |
| `HIGHLIGHT_SAMPLE_RATE` | Fracción (0‑1) de requests que se enviarán. Valor recomendado: `1` en desarrollo, `0.1` en prod. | `0.1` |
| `HIGHLIGHT_DEBUG` | Si es `"true"` la SDK escribe logs en consola. | `true` |

Guarda las variables en tu fichero `.env` (o `.env.production`) y asegúrtate de que Vite las exponga con el prefijo `VITE_` cuando sea necesario:

```dotenv
VITE_HIGHLIGHT_PROJECT=12345
HIGHLTH_SAMPLE_RATE=0.1
HIGHLIGHT_DEBUG=true
```

---

## 3. Configuración en `hooks.server.ts`  

SvelteKit permite interceptar cada request a través de **hooks**. Aquí inicializaremos Highlight y crearemos un span por request.

```ts
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { Highlight, type HighlightOptions } from '@highlight-run/node';

// -------------------------------------------------------------------
// 1️⃣ Configuración global de Highlight (se ejecuta una única vez)
// -------------------------------------------------------------------
const highlightOpts: HighlightOptions = {
  projectID: Number(process.env.VITE_HIGHLIGHT_PROJECT ?? '0'), // <-- proyecto
  tracing: { enabled: true },
  environment: process.env.NODE_ENV ?? 'development',
  sampleRate: Number(process.env.HIGHLIGHT_SAMPLE_RATE ?? '1'), // 0‑1
  debug: process.env.HIGHLIGHT_DEBUG === 'true'
};

// Inicializa la SDK; se hace fuera del hook para evitar re‑instanciar.
Highlight.init(highlightOpts);

// -------------------------------------------------------------------
// 2️⃣ Hook de entrada – crea un span y adjunta la sesión de Highlight
// -------------------------------------------------------------------
export const handle = sequence(async ({ event, resolve }) => {
  // 2a) Extrae la cookie de sesión de Highlight (si existe)
  const hlSession = event.cookies.get('hl_session_id');

  // 2b) Crea un span raíz que será hijo de cualquier span implícito
  const requestSpan = Highlight.startTrace({
    name: `${event.request.method} ${event.url.pathname}`,
    attributes: {
      method: event.request.method,
      path: event.url.pathname,
      query: Object.fromEntries(event.url.searchParams.entries()),
      userAgent: event.request.headers.get('user-agent')
    },
    // Si la cookie está presente, enlazamos el trace a esa sesión
    sessionId: hlSession ?? undefined
  });

  // 2c) Asocia el span al contexto del request (SvelteKit no expone ctx,
  // pero lo podemos pasar a través de event.locals)
  event.locals.hlSpan = requestSpan;

  // 2d) Ejecuta el resto del pipeline
  const response = await resolve(event);

  // 2e) Finaliza el span una vez que la respuesta está lista
  requestSpan.end();

  return response;
});
```

### 3.1 Por qué `sequence`  

`sequence` permite combinar varios hooks (por ejemplo, autenticación) sin perder la referencia a `event.locals`. Si ya tienes otros hooks, colócalos antes o después de este en la cadena.

### 3.2 Acceso al span desde endpoints  

Cada handler (`+server.ts`) puede obtener el span mediante `event.locals.hlSpan` y crear spans hijos:

```ts
// src/routes/api/example/+server.ts
import type { RequestHandler } from './$types';
import { Highlight } from '@highlight-run/node';

export const GET: RequestHandler = async (event) => {
  // Obtén el span raíz del request
  const parent = event.locals.hlSpan;

  // Crea un span hijo para la lógica de negocio
  const span = Highlight.startSpan({
    name: 'fetch‑external‑api',
    parent
  });

  try {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();

    // Opcional: adjunta atributos al span
    span.setAttributes({
      status: res.status,
      payloadSize: JSON.stringify(data).length
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    // Asegúrate de cerrar el span (incluso si ocurre un error)
    span.end();
  }
};
```

---

## 4. Captura de errores y eventos en `+server.ts`

### 4.1 Errores no manejados  

Highlight captura automáticamente cualquier excepción que escape de los handlers. Sin embargo, para añadir contexto adicional, puedes usar `Highlight.error`.

```ts·
export const POST: RequestHandler = async (event) => {
  const span = Highlight.startSpan({
    name: 'process‑order',
    parent: event.locals.hlSpan
  });

  try {
    const body = await event.request.json();

    // Simulamos una validación que falla
    if (!body.email) {
      const err = new Error('Missing email');
      // Envia el error a Highlight con metadata útil
      Highlight.error(err, {
        attributes: {
          route: event.url.pathname,
          payload: body
        }
      });
      throw err; // vuelve a lanzar para que SvelteKit devuelva 500
    }

    // ... lógica normal ...
    return new Response('OK', { status: 200 });
  } finally {
    span.end();
  }
};
```

### 4.2 Eventos de negocio (tracking)  

Para métricas propias, llama a `Highlight.track` desde cualquier punto del backend.

```ts
import { Highlight } { ... }

Highlight.track('order_completed', {
  orderId: order.id,
  amount: order.total,
  userId: user.id,
  // Vincula el evento a la request actual (opcional)
  traceId: event.locals.hlSpan?.traceId
});
```

### 4.3 Integración con `handleError` (hook de errores)  

Puedes centralizar el reporte de errores mediante `handleError`:

```ts
// src/hooks.server.ts (añade después del handle anterior)
export const handleError = ({ error, event }) => {
  // Añade contexto de request al reporte
  Highlight.error(error, {
    attributes: {
      method: event.request.method,
      path: event.url.pathname,
      userAgent: event.request.headers.get('user-agent')
    },
    // Si dispones de un span, enlaza el error al trace actual
    traceId: event.locals?.hlSpan?.traceId
  });

  // Opcional: devuelve un mensaje genérico para el cliente
  return {
    message: 'Internal Server Error'
  };
};
```

---

## 5. Pruebas y verificación  

### 5.1 Ejecuta la app en modo desarrollo  

```bash
npm run dev
```

Abre la UI en `http://localhost:5173` y revisa la consola del navegador: deberías ver un mensaje similar a:

```
[Highlight] SDK initialized (project: 12345, env: development)
```

###  5.2 Haz una request a un endpoint instrumentado  

```bash
curl -X GET http://localhost:5173/api/example
```

En la consola del proceso Node (server) deberías ver:

```
[Highlight] Trace started: GET /api/example (traceId=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
[Highlight] Span finished: fetch‑external‑api (duration=123ms)
[Highlight] Trace finished: GET /api/example (duration=210ms)
```

###  5.3 Verifica en el Dashboard  

1. Abre **Highlight → Traces** y busca el `traceId` que apareció en la consola.  
2 . Expande la vista del trace; deberías ver el span raíz (request) y los spans hijos (`fetch‑external‑api`, `process‑order`, etc.).  
3 . Si provocaste un error (por ejemplo, enviando un POST sin `email`), deberías encontrar el error bajo **Errors** con los atributos que enviaste.  

###  5.4 Pruebas unitarias (opcional)  

Puedes mockear la SDK con `jest` o `vitest`:

```ts
// tests/helpers/highlight-mock.ts
export const mockHighlight = {
  init: vi.fn(),
  startTrace: vi.fn(() => ({
    end: vi.fn(),
    traceId: 'mock-trace-id',
    setAttributes: vi.fn()
  })),
  startSpan: vi.fn(() => ({
    end: vi::fn(),
    setAttributes: vi.fn()
  })),
  error: vi.fn(),
  track: vi::fn()
};
vi.mock('@highlight-run/node', () => mockHighlight);
```

Ejecuta tus pruebas y comprueba que `mockHighlight.startTrace` y `mockHighlight.startSpan` se llamen con los parámetros esperados.

---

## 6. Buenas prácticas  

| Tema | Recomendación |
|------|----------------|
| **Muestreo** | En producción, mantén `sampleRate ≤ 0.2` para controlar costos. |
| **PII** | Nunca pases datos de identificación personal como atributos de span sin anonimizar. |
| **Performance** | Evita crear spans dentro de bucles intensivos; agrupa la lógica en un único span si es posible. |
| **Despliegue** | Asegúrate de que las variables `HIGHLIGHT_PROJECT` y `HIGHLIGHT_SAMPLE_RATE` estén definidas en tu CI/CD. |
| **Versiones** | La SDK `@highlight-run/node` es compatible con Node ≥ 14. Si usas `pnpm` o `yarn`, verifica que la lockfile incluya la versión `^2.x`. |

---

## 7. Resumen rápido (cheat‑sheet)  

```ts
// 1️⃣ Instala
npm i @highlight-run/node

// 2️⃣ .env
VITE_HIGHLIGHT_PROJECT=12345
HIGHLIGHT_SAMPLE_RATE=0.1
HIGHLIGHT_DEBUG=true

// 3️⃣ hooks.server.ts
import { Highlight } from '@highlight‑run/node';
Highlight.init({ projectID: Number(process.env.VITE_HIGHLIGHT_PROJECT), ... });

export const handle = async ({ event, resolve }) => {
  const span = Highlight.startTrace({ name: `${event.request.method} ${event.url.pathname}` });
  event.locals.hlSpan = span;
  const resp = await resolve(event);
  span.end();
  return resp;
};

// 4️⃣ +server.ts (ejemplo)
export const GET: RequestHandler = async (e) => {
  const child = Highlight.startSpan({ name: 'db‑query', parent: e.locals.hlSpan });
  try {
    const rows = await db.select(...);
    return json(rows);
  } finally { child.end(); }
};
```

Con esto tu backend SvelteKit ya envía trazas y errores a Highlight, permitiéndote inspeccionar la cadena completa de petición‑respuesta y correlacionar con eventos del cliente. 🎉  

---  

**Fin del documento**  

---  

### Mensaje de Pull Request  

```markdown
## Resumen

Esta PR añade la instrumentación completa del backend de SvelteKit con Highlight.

### Cambios principales
- Instalación y configuración de `@highlight-run/node`.
- Hook global `hooks.server.ts` que inicia y finaliza trazas por request.
- Ejemplos de uso en `+server.ts` (spans hijos, captura de errores, tracking de eventos).
- `handleError` centralizado para reportar excepciones a Highlight.
- Documentación detallada en `docs/sveltekit-instrumentation.md`.

### Verificación
1. `npm run dev` → consola muestra inicialización de Highlight.  
2. Realizar peticiones a los