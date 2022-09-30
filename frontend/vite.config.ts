/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
import react from '@vitejs/plugin-react'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'url'
import { loadEnv } from 'vite'
import vitePluginImp from 'vite-plugin-imp'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Adding something here? Please update `.env.d.ts` to update our Typescript definitions.
// *DO NOT* put something in here unless you're positive it's safe to expose this to the world.

// Any env vars with the following prefixes will be exposed to the frontend via import.meta.env.*
// See: https://vitejs.dev/config/shared-options.html#envprefix
const ENVVAR_ALLOWLIST = [
	// Everything that follows is an allowlist of env vars that we want to expose to the frontend that do not
	// match the prefixes listed above.
	'SLACK_CLIENT_ID',
]

const validateSafeAllowList = (env: Record<string, string>) => {
	ENVVAR_ALLOWLIST.forEach((allowListEnvVar) => {
		Object.keys(env).forEach((key) => {
			if (key === allowListEnvVar) {
				return
			}

			if (key.startsWith(allowListEnvVar)) {
				const error = `

ENVVAR_ALLOWLIST is not safe because ${key} would match the prefix of ${allowListEnvVar}
Rename ${key} to something such that "${key}".startsWith("${allowListEnvVar}") returns false.
`
				throw new Error(error)
			}
		})
	})
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	validateSafeAllowList(env)

	return {
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
		envPrefix: ['REACT_APP_', 'VITE_', ...ENVVAR_ALLOWLIST],
		server: {
			port: 3000,
			https: {
				key: join(__dirname, '../backend/localhostssl/server.key'),
				cert: join(__dirname, '../backend/localhostssl/server.crt'),
			},
			// ensure hmr works when proxying frontend
			strictPort: true,
			hmr: {
				clientPort: 3000,
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
	}
})
