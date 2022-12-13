// vite.config.ts
import path from 'path'
import { defineConfig } from 'file:///Users/chris/code/highlight/packages/ui/node_modules/vitest/dist/config.js'
import react from 'file:///Users/chris/code/highlight/node_modules/@vitejs/plugin-react/dist/index.mjs'
import { vanillaExtractPlugin } from 'file:///Users/chris/code/highlight/node_modules/@vanilla-extract/vite-plugin/dist/vanilla-extract-vite-plugin.cjs.js'
import dts from 'file:///Users/chris/code/highlight/node_modules/vite-plugin-dts/dist/index.mjs'
var __vite_injected_original_dirname = '/Users/chris/code/highlight/packages/ui'
var vite_config_default = defineConfig({
	build: {
		lib: {
			entry: path.resolve(
				__vite_injected_original_dirname,
				'src/index.ts',
			),
			name: '@highlight-run/ui',
		},
	},
	resolve: {
		alias: {
			'@components': path.resolve(
				__vite_injected_original_dirname,
				'./src/components',
			),
		},
	},
	test: {
		environment: 'happy-dom',
		globals: true,
	},
	plugins: [dts(), react(), vanillaExtractPlugin()],
})
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY2hyaXMvY29kZS9oaWdobGlnaHQvcGFja2FnZXMvdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9jaHJpcy9jb2RlL2hpZ2hsaWdodC9wYWNrYWdlcy91aS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvY2hyaXMvY29kZS9oaWdobGlnaHQvcGFja2FnZXMvdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IHZhbmlsbGFFeHRyYWN0UGx1Z2luIH0gZnJvbSAnQHZhbmlsbGEtZXh0cmFjdC92aXRlLXBsdWdpbidcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRidWlsZDoge1xuXHRcdGxpYjoge1xuXHRcdFx0ZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcblx0XHRcdG5hbWU6ICdAaGlnaGxpZ2h0LXJ1bi91aScsXG5cdFx0fSxcblx0fSxcblx0cmVzb2x2ZToge1xuXHRcdGFsaWFzOiB7XG5cdFx0XHQnQGNvbXBvbmVudHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29tcG9uZW50cycpLFxuXHRcdH0sXG5cdH0sXG5cdHRlc3Q6IHtcblx0XHRlbnZpcm9ubWVudDogJ2hhcHB5LWRvbScsXG5cdFx0Z2xvYmFsczogdHJ1ZSxcblx0fSxcblx0cGx1Z2luczogW2R0cygpLCByZWFjdCgpLCB2YW5pbGxhRXh0cmFjdFBsdWdpbigpXSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVTLE9BQU8sVUFBVTtBQUN4VCxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyw0QkFBNEI7QUFDckMsT0FBTyxTQUFTO0FBSmhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLE9BQU87QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNKLE9BQU8sS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUM3QyxNQUFNO0FBQUEsSUFDUDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLGVBQWUsS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLElBQzFEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0wsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLEVBQ1Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLHFCQUFxQixDQUFDO0FBQ2pELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
