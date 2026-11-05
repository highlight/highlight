# 📄 Documentación de Instrumentación del Backend en SvelteKit  
*Autor: @ mau16ro (consultado con ChatGPT – expert‑developer)*  

---  

## 📚 Índice  

1. [Objetivo y alcance](#-objetivo-y-alcance)  
2. [Arquitectura de la instrumentación](#-arquitectura-de-la-instrumentación)  
3. [Tecnologías y dependencias recomendadas](#-tecnologías-y-dependencias-recomendadas)  
4. [Estrategia de instrumentación](#-estrategia-de-instrumentación)  
   - 4.1 [Hooks globales (`handle`, `handleError`)](#41-hooks-globales-handle-handleerror)  
   - 4.2 [Endpoints / Server‑only routes](#42-endpoints--server‑only-routes)  
   - 4.3 [Adapters y procesos de build](#43-adapters-y-procesos-de-build)  
   - 4.4 [Integración con bases de datos y clientes externos](#44-integración-con-bases-de-datos-y‑clientes-externos)  
5. [Configuración paso‑a‑paso](#-configuración-paso‑a‑paso)  
   - 5.1 [Instalación de dependencias](#51-instalación-de-dependencias)  
   - 5.2 [Inicialización de OpenTelemetry (OTel)](#52-inicialización-de-opentelemetry-otel)  
   - 5.3 [Hook `src/hooks.server.ts`](#53-hook-srchooksserverts)  
   - 5.4 [Instrumentar endpoints (`src/routes/**/*.ts`)](#54-instrumentar-endpoints-srcroutes)  
   - 5.5 [Exportar métricas para Prometheus](#55-exportar-métricas-para-prometheus)  
   - 5.6 [Envío de trazas a un collector (Jaeger / Tempo / Datadog)](#56-envío-de-trazas-a-un-collector)  
   - 5.7 [Logging estructurado con Pino / Winston](#57-logging-estructurado-con-pino--winston)  
6. [Ejemplo completo de proyecto minimalista](#-ejemplo-completo-de-proyecto-minimalista)  
7. [CI / CD – pruebas y validaciones](#-ci--cd--pruebas-y-validaciones)  
8. [Buenas prácticas y checklist de producción](#-buenas-prácticas-y-checklist-de-producción)  
9. [Resolución de problemas comunes (FAQ)](#-resolución-de-problemas-comunes-faq)  
10. [Referencias y recursos adicionales](#-referencias-y-recursos-adicionales)  

---  

## 🎯 1. Objetivo y alcance  

- **Objetivo:** Proveer una guía completa, paso‑a‑paso y con ejemplos de código para instrumentar el **backend** de una aplicación **SvelteKit** (v1.38+).  
- **Alcance:**  
  - Trazas distribuidas (OpenTelemetry).  
  - Métricas (Prometheus‑compatible).  
  - Logging estructurado y correlacionado.  
  - Integración con servicios de observabilidad externos (Jaeger, Tempo, Datadog, Sentry).  
  - Compatibilidad con los **adapters** más comunes (Node, Vercel, Cloudflare Workers, Netlify).  

> **Nota:** La instrumentación del *frontend* (Svelte) queda fuera de este documento; se asume que se usará la misma librería OTel en el cliente si fuera necesario.

---  

## 🏗️ 2. Arquitectura de la instrumentación  

```mermaid
flowchart TD
    subgraph SvelteKit
        A[hooks.server.ts] --> B[Endpoints / server routes]
        B --> C[DB / API clients]
    end

    subgraph Observability
        O1[OpenTelemetry SDK] --> O2[Tracer Provider]
        O1 --> O3[Meter Provider]
        O1 --> O4[Logger Provider]
        O2 --> O5[Exporters (Jaeger, OTLP, etc.)]
        O3 --> O6[Prometheus Exporter]
        O4 --> O7[JSON Logger (Pino)]
    end

    A & B & C --> O1
    O5 -.->|traces| Collector
    O6 -.->|metrics| /metrics endpoint
    O7 -->|logs| stdout / log‑shipper
```

- **Hooks** son el punto de entrada único donde se crea y se propaga el *contexto* de trazas y métricas.  
- Cada **endpoint** (API route o `+server.ts`) hereda el contexto y crea *spans* hijos.  
- **Clientes externos** (p. ej., Prisma, Axios, fetch) se envuelven con *instrumentation* automática o manual.  
- El **exporter** envía datos a un **collector** (OTLP, Jaeger, Tempo, etc.).  
- Métricas se exponen en `/metrics` (Prometheus).  

---  

## 🛠️ 3. Tecnologías y dependencias recomendadas  

| Categoría | Librería | Motivo | Comentario |
|-----------|----------|--------|------------|
| **Tracing** | `@opentelemetry/sdk-node` + `@opentelemetry/api` | SDK Node.js oficial | Base para todos los demás componentes |
| | `@opentelemetry/instrumentation-http` | Captura automática de `fetch`/`http` | Funciona con `node-fetch`, `axios`, etc. |
| | `@opentelemetry/instrumentation-express` | Si usas el adapter *node* (Express) | Opcional, pero útil en pruebas locales |
| | `@opentelemetry/exporter-trace-otlp-http` | Exporta a cualquier collector vía OTLP/HTTP | Alternativas: Jaeger, Zipkin |
| **Metrics** | `@opentelemetry/sdk-metrics` | Métricas de aplicación | |
| | `@opentelemetry/exporter-metrics-prometheus` | Endpoint `/metrics` | |
| **Logging** | `pino` (o `winston`) + `pino-http` | Logging estructurado de alto rendimiento | `pino-http` integra automáticamente request‑id y trace‑id |
| **DB Instrumentation** | `@prisma/instrumentation` (si usas Prisma) <br> `@opentelemetry/instrumentation-mongodb` <br> `@opentelemetry/instrumentation-pg` | Instrumenta consultas SQL/NoSQL | Depende de tu stack de datos |
| **Env variables** | `dotenv` | Carga segura de secrets | |
| **Testing** | `vitest` + `@opentelemetry/testing` | Validar que los spans se crean | |
| **CI** | `GitHub Actions` / `GitLab CI` | Ejecutar pruebas y validar la configuración OTel | |

> **Tip:** Mantener las versiones alineadas con la rama `v1.x` de SvelteKit para evitar conflictos con el compilador Vite.

---  

## 🧭 4. Estrategia de instrumentación  

### 4.1 Hooks globales (`handle`, `handleError`)

- **`handle`**: crea el **TracerProvider** y el **MeterProvider** una sola vez por proceso y los adjunta al `event.locals`.  
- **`handleError`**: captura excepciones no manejadas y registra un *span* de error.  

### 4.2 Endpoints / Server‑only routes

- Cada archivo `+server.ts` (o `api/*.ts`) recibe el `event` con el contexto OTel.  
- Se crea un **span** manual usando `tracer.startSpan(name, { kind: SpanKind.SERVER })`.  
- Se llama a `await span.end()` al final del handler (incluyendo en `catch`).  

### 4.3 Adapters y procesos de build

| Adapter | Comentario de instrumentación |
|---------|-------------------------------|
| **@sveltejs/adapter-node** | El proceso de Node es el único que necesita el SDK; `src/hooks.server.ts` se ejecuta una vez al iniciar. |
| **@sveltejs/adapter-vercel** | Vercel ejecuta cada request en una *lambda* aislada → SDK debe inicializarse **dentro** del handler, pero se puede reutilizar usando `global.__OTEL_INITIALIZED__`. |
| **@sveltejs/adapter-cloudflare** | Cloudflare Workers no soportan Node SDK; usar **Web Tracer** (`@opentelemetry/sdk-browser`) y enviar a un collector via `fetch`. |
| **@sveltejs/adapter-static** | No hay backend → no aplicar. |

### 4.4 Integración con bases de datos y clientes externos  

- **Prisma** → `import '@prisma/instrumentation';` (auto‑instrumenta).  
- **Axios** → `registerInstrumentations({ instrumentations: [new HttpInstrumentation()] })` captura automáticamente.  
- **Fetch** nativo (Node ≥18) → también cubierto por `http` instrumentation.  

---  

## 🚀 5. Configuración paso‑a‑paso  

> **Prerequisitos**  
> - Node ≥ 18 (LTS).  
> - SvelteKit ≥ 1.38 (compatible con Vite 5).  
> - Un collector OTLP disponible (ejemplo: `http://localhost:4318`).  

### 5.1 Instalación de dependencias  

```bash
# Core OpenTelemetry
npm i -D @opentelemetry/sdk-node \
          @opentelemetry/api \
          @opentelemetry/resources \
          @opentelemetry/semantic-conventions

# Instrumentations (elige las que necesites)
npm i -D @opentelemetry/instrumentation-http \
          @opentelemetry/instrumentation-fetch \
          @opentelemetry/instrumentation-aws-sdk \
          @opentelemetry/instrumentation-express

# Exporters
npm i -D @opentelemetry/exporter-trace-otlp-http \
          @opentelemetry/exporter-metrics-prometheus

# Logging
npm i pino pino-http

# (Opcional) DB instrumentation
npm i -D @prisma/instrumentation   # si usas Prisma
npm i -D @opentelemetry/instrumentation-pg   # PostgreSQL
npm i -D @opentelemetry/instrumentation-mongodb

# Utils
npm i dotenv
```

### 5.2 Inicialización de OpenTelemetry (OTel)  

Crea un archivo **`src/lib/otel.ts`** que exporte `tracer` y `meter`.  

```ts
// src/lib/otel.ts
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-metrics-prometheus';

// ------------------------------------------------------------------
// 1️⃣  Configuración de diagnóstico (solo dev)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// 2️⃣  Resource (información del service)
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME ?? 'sveltekit-backend',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'development',
});

// ------------------------------------------------------------------
// 3️⃣  Tracing Provider
const tracerProvider = new NodeTracerProvider({ resource });
const otlpTraceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
});
tracerProvider.addSpanProcessor(new BatchSpanProcessor(otlpTraceExporter));
tracerProvider.register();

// Auto‑instrumentations
registerInstrumentations({
  tracerProvider,
  instrumentations: [
    new HttpInstrumentation(),
    new FetchInstrumentation(),
    // add more (e.g., Prisma, PG) here
  ],
});

// ------------------------------------------------------------------
// 4️⃣  Metrics Provider + Prometheus
const prometheusExporter = new PrometheusExporter(
  { startServer: true, port: Number(process.env.PROMETHEUS_PORT) || 9464 },
  () => console.log('🧮 Prometheus metrics exposed on /metrics')
);
const meterProvider = new MeterProvider({
  resource,
});
meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: prometheusExporter,
}));

// ------------------------------------------------------------------
// 5️⃣  Export the objects
export const tracer = tracerProvider.getTracer('sveltekit-backend-tracer');
export const meter