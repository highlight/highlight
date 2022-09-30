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
const ENVVAR_ALLOWLIST = ['SLACK_CLIENT_ID']

// In order to prevent accidentally env var leakage, Vite only allows the configuration of defining
// the environment variable prefix (see: https://vitejs.dev/guide/env-and-mode.html#env-variables-and-modes)
// Currently, we expose environment variables prefixed with `VITE_` and `REACT_`.
//
// While this feels like a nice feature, it doesn't play very well with our existing environment variables.
//
// This piece of code allows us to define an allowlist (see above) into the prefix system but ensures only
// the env vars on the allowlist are actually exposed.
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
