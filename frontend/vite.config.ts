/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
import react from '@vitejs/plugin-react'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'url'
import vitePluginImp from 'vite-plugin-imp'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: ['babel-plugin-react-wrapped-display-name'],
			},
		}),
		tsconfigPaths(),
		svgr(),
		vitePluginImp({
			libList: [
				{
					libName: 'antd',
					style: (name) => `antd/es/${name}/style/index.js`,
				},
				// TODO: enable this later to reduce bundle size
				// {
				// 	libName: 'lodash',
				// 	libDirectory: '',
				// 	camel2DashComponentName: false,
				// },
			],
		}),
	],
	envPrefix: ['REACT_APP_', 'VITE_'],
	server: {
		port: 3000,
		https: {
			key: join(__dirname, '../backend/localhostssl/server.key'),
			cert: join(__dirname, '../backend/localhostssl/server.crt'),
		},
	},
	build: {
		outDir: 'build',
		sourcemap: !!process.env.SOURCEMAP,
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./src/setupTests.ts'],
	},
	css: {
		devSourcemap: true,
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
				modifyVars: {
					hack: `true; @import "${join(
						__dirname,
						'src/style/AntDesign/antd.overrides.less',
					)}";`,
				},
			},
		},
	},
})
