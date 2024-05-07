// vite.config.ts
import { resolve as resolvePath } from 'path'
import { defineConfig } from 'file:///Users/chris/code/highlight/sdk/firstload/node_modules/vite/dist/node/index.js'
import typescript from 'file:///Users/chris/code/highlight/sdk/firstload/node_modules/@rollup/plugin-typescript/dist/es/index.js'
import resolve from 'file:///Users/chris/code/highlight/sdk/firstload/node_modules/@rollup/plugin-node-resolve/dist/es/index.js'
import commonjs from 'file:///Users/chris/code/highlight/sdk/firstload/node_modules/@rollup/plugin-commonjs/dist/es/index.js'
import json from 'file:///Users/chris/code/highlight/sdk/firstload/node_modules/@rollup/plugin-json/dist/es/index.js'
var __vite_injected_original_dirname =
	'/Users/chris/code/highlight/sdk/firstload'
var vite_config_default = defineConfig({
	envPrefix: ['REACT_APP_'],
	server: {
		host: '0.0.0.0',
		port: 8877,
		strictPort: true,
		hmr: {
			clientPort: 8877,
		},
	},
	build: {
		target: 'es6',
		lib: {
			formats: ['es', 'umd'],
			entry: resolvePath(
				__vite_injected_original_dirname,
				'src/index.tsx',
			),
			name: 'H',
			fileName: 'index',
		},
		minify: true,
		sourcemap: true,
		emptyOutDir: false,
		rollupOptions: {
			treeshake: 'smallest',
			plugins: [
				json(),
				commonjs({
					transformMixedEsModules: true,
				}),
				resolve({
					browser: true,
				}),
				typescript({
					outputToFilesystem: true,
				}),
			],
			output: {
				exports: 'named',
			},
		},
	},
})
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY2hyaXMvY29kZS9oaWdobGlnaHQvc2RrL2ZpcnN0bG9hZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2NocmlzL2NvZGUvaGlnaGxpZ2h0L3Nkay9maXJzdGxvYWQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2NocmlzL2NvZGUvaGlnaGxpZ2h0L3Nkay9maXJzdGxvYWQvdml0ZS5jb25maWcudHNcIjsvLyB2aXRlLmNvbmZpZy50c1xuaW1wb3J0IHsgcmVzb2x2ZSBhcyByZXNvbHZlUGF0aCB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHR5cGVzY3JpcHQgZnJvbSAnQHJvbGx1cC9wbHVnaW4tdHlwZXNjcmlwdCdcbmltcG9ydCByZXNvbHZlIGZyb20gJ0Byb2xsdXAvcGx1Z2luLW5vZGUtcmVzb2x2ZSdcbmltcG9ydCBjb21tb25qcyBmcm9tICdAcm9sbHVwL3BsdWdpbi1jb21tb25qcydcbmltcG9ydCBqc29uIGZyb20gJ0Byb2xsdXAvcGx1Z2luLWpzb24nXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdGVudlByZWZpeDogWydSRUFDVF9BUFBfJ10sXG5cdHNlcnZlcjoge1xuXHRcdGhvc3Q6ICcwLjAuMC4wJyxcblx0XHRwb3J0OiA4ODc3LFxuXHRcdHN0cmljdFBvcnQ6IHRydWUsXG5cdFx0aG1yOiB7XG5cdFx0XHRjbGllbnRQb3J0OiA4ODc3LFxuXHRcdH0sXG5cdH0sXG5cdGJ1aWxkOiB7XG5cdFx0dGFyZ2V0OiAnZXM2Jyxcblx0XHRsaWI6IHtcblx0XHRcdGZvcm1hdHM6IFsnZXMnLCAndW1kJ10sXG5cdFx0XHRlbnRyeTogcmVzb2x2ZVBhdGgoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzeCcpLFxuXHRcdFx0bmFtZTogJ0gnLFxuXHRcdFx0ZmlsZU5hbWU6ICdpbmRleCcsXG5cdFx0fSxcblx0XHRtaW5pZnk6IHRydWUsXG5cdFx0c291cmNlbWFwOiB0cnVlLFxuXHRcdGVtcHR5T3V0RGlyOiBmYWxzZSxcblx0XHRyb2xsdXBPcHRpb25zOiB7XG5cdFx0XHR0cmVlc2hha2U6ICdzbWFsbGVzdCcsXG5cdFx0XHRwbHVnaW5zOiBbXG5cdFx0XHRcdGpzb24oKSxcblx0XHRcdFx0Y29tbW9uanMoe1xuXHRcdFx0XHRcdHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0cmVzb2x2ZSh7XG5cdFx0XHRcdFx0YnJvd3NlcjogdHJ1ZSxcblx0XHRcdFx0fSksXG5cdFx0XHRcdHR5cGVzY3JpcHQoe1xuXHRcdFx0XHRcdG91dHB1dFRvRmlsZXN5c3RlbTogdHJ1ZSxcblx0XHRcdFx0fSksXG5cdFx0XHRdLFxuXHRcdFx0b3V0cHV0OiB7XG5cdFx0XHRcdGV4cG9ydHM6ICduYW1lZCcsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsV0FBVyxtQkFBbUI7QUFDdkMsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sY0FBYztBQUNyQixPQUFPLFVBQVU7QUFOakIsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsV0FBVyxDQUFDLFlBQVk7QUFBQSxFQUN4QixRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsTUFDSixZQUFZO0FBQUEsSUFDYjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNKLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxNQUNyQixPQUFPLFlBQVksa0NBQVcsZUFBZTtBQUFBLE1BQzdDLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNYO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDZCxXQUFXO0FBQUEsTUFDWCxTQUFTO0FBQUEsUUFDUixLQUFLO0FBQUEsUUFDTCxTQUFTO0FBQUEsVUFDUix5QkFBeUI7QUFBQSxRQUMxQixDQUFDO0FBQUEsUUFDRCxRQUFRO0FBQUEsVUFDUCxTQUFTO0FBQUEsUUFDVixDQUFDO0FBQUEsUUFDRCxXQUFXO0FBQUEsVUFDVixvQkFBb0I7QUFBQSxRQUNyQixDQUFDO0FBQUEsTUFDRjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ1AsU0FBUztBQUFBLE1BQ1Y7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
