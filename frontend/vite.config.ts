/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
import react from '@vitejs/plugin-react'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'url'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
	plugins: [react(), tsconfigPaths(), svgr()],
	envPrefix: 'REACT_APP_',
	server: {
		port: 3000,
		https: {
			key: join(__dirname, '../backend/localhostssl/server.key'),
			cert: join(__dirname, '../backend/localhostssl/server.crt'),
		},
	},
	build: {
		outDir: 'build',
		sourcemap: false,
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./src/setupTests.ts'],
	},
})
