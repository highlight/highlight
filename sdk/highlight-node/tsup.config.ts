import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	dts: true,
	sourcemap: true,
	noExternal: [
		'@opentelemetry/api',
		'@opentelemetry/auto-instrumentations-node',
		'@opentelemetry/core',
		'@opentelemetry/exporter-trace-otlp-http',
		'@opentelemetry/resources',
		'@opentelemetry/sdk-node',
		'@opentelemetry/sdk-trace-base',
		'@opentelemetry/semantic-conventions',
	],
})
