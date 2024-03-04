import { NextConfig } from 'next'
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import HighlightWebpackPlugin from './highlight-webpack-plugin.js'
import { WebpackConfigContext } from 'next/dist/server/config-shared'

interface HighlightConfigOptionsDefault {
	uploadSourceMaps: boolean
	configureHighlightProxy: boolean
	apiKey: string
	appVersion: string
	environment: string
	serviceName: string
	sourceMapsPath: string
	sourceMapsBasePath: string
	sourceMapsBackendUrl?: string
}

export interface HighlightConfigOptions {
	/**
	 * Explicitly enable or disable source map uploading during production builds.
	 * By default, source maps are uploaded if both:
	 * 1. The NextConfig.productionBrowserSourceMaps is not true
	 * 2. An API key is set through the apiKey option
	 * or HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY environment variable
	 */
	uploadSourceMaps?: boolean
	/**
	 * Configures a rewrite at /highlight-events for proxying Highlight requests.
	 * @default true
	 */
	configureHighlightProxy?: boolean
	/**
	 * API key used to link to your Highlight project when uploading source maps.
	 * This can also be set through the HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY environment variable.
	 */
	apiKey?: string
	/**
	 * App version used when uploading source maps.
	 */
	appVersion?: string
	/**
	 * Specifies the environment your application is running in.
	 * This is useful to distinguish whether your session was recorded on localhost or in production.
	 */
	environment?: string
	/**
	 * Name of your app.
	 */
	serviceName?: string
	/**
	 * File system root directory containing all your source map files.
	 * @default '.next/'
	 */
	sourceMapsPath?: string
	/**
	 * Base path to append to your source map URLs when uploaded to Highlight.
	 * @default '_next/'
	 */
	sourceMapsBasePath?: string
	/**
	 * Optional, backend url for private graph to use for uploading (for self-hosted highlight deployments).
	 */
	sourceMapsBackendUrl?: string
}

const getDefaultOpts = async (
	config: NextConfig,
	highlightOpts?: HighlightConfigOptions,
): Promise<HighlightConfigOptionsDefault> => {
	const isProdBuild = process.env.NODE_ENV === 'production'
	const hasSourcemapApiKey =
		!!process.env.HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY ||
		!!highlightOpts?.apiKey
	let version: string | null = null
	if (config.generateBuildId) {
		const buildId = config.generateBuildId()
		if (typeof buildId === 'string') {
			version = buildId
		} else {
			version = await buildId
		}
	}

	return {
		uploadSourceMaps:
			isProdBuild &&
			(highlightOpts?.uploadSourceMaps ??
				(!config.productionBrowserSourceMaps && hasSourcemapApiKey)),
		configureHighlightProxy: highlightOpts?.configureHighlightProxy ?? true,
		apiKey: highlightOpts?.apiKey ?? '',
		appVersion: highlightOpts?.appVersion ?? version ?? '',
		environment: highlightOpts?.environment ?? '',
		serviceName: highlightOpts?.serviceName ?? '',
		sourceMapsPath: highlightOpts?.sourceMapsPath ?? '.next/',
		sourceMapsBasePath: highlightOpts?.sourceMapsBasePath ?? '_next/',
		sourceMapsBackendUrl: highlightOpts?.sourceMapsBackendUrl,
	}
}

type NextConfigObject = NextConfig
type NextConfigFunction = (
	phase: string,
	{ defaultConfig }: { defaultConfig: any },
) => NextConfig
type NextConfigAsyncFunction = (
	phase: string,
	{ defaultConfig }: { defaultConfig: any },
) => Promise<NextConfig>
type NextConfigInput =
	| NextConfigObject
	| NextConfigFunction
	| NextConfigAsyncFunction

const getHighlightConfig = async (
	config: NextConfig,
	highlightOpts?: HighlightConfigOptions,
) => {
	const defaultOpts = await getDefaultOpts(config, highlightOpts)

	let newRewrites = config.rewrites
	if (defaultOpts.uploadSourceMaps || defaultOpts.configureHighlightProxy) {
		newRewrites = async () => {
			let re
			if (!config.rewrites) {
				re = new Array<Rewrite>()
			} else {
				re = await config.rewrites()
			}

			const sourcemapRewrite = {
				source: '/:path*.map',
				destination: '/404',
			}

			const highlightRewrite = {
				source: '/highlight-events',
				destination: 'https://pub.highlight.run',
			}

			if (!re || Array.isArray(re)) {
				return {
					beforeFiles: defaultOpts.uploadSourceMaps
						? [sourcemapRewrite]
						: [],
					afterFiles: defaultOpts.configureHighlightProxy
						? (re ?? []).concat(highlightRewrite)
						: [],
					fallback: [],
				}
			} else {
				return {
					beforeFiles: defaultOpts.uploadSourceMaps
						? (re.beforeFiles ?? []).concat(sourcemapRewrite)
						: re.beforeFiles,
					afterFiles: defaultOpts.configureHighlightProxy
						? (re.afterFiles ?? []).concat(highlightRewrite)
						: re.afterFiles,
					fallback: re.fallback,
				}
			}
		}
	}

	let newWebpack = config.webpack
	if (defaultOpts.uploadSourceMaps) {
		newWebpack = (webpackConfig: any, opts: WebpackConfigContext) => {
			let originalConfig = webpackConfig
			if (config.webpack) {
				originalConfig = config.webpack(webpackConfig, opts)
			}

			originalConfig.plugins.push(
				new HighlightWebpackPlugin(
					defaultOpts.apiKey,
					defaultOpts.appVersion,
					defaultOpts.sourceMapsPath,
					defaultOpts.sourceMapsBasePath,
					defaultOpts.sourceMapsBackendUrl,
				),
			)

			return originalConfig
		}
	}

	return {
		...config,
		productionBrowserSourceMaps:
			defaultOpts.uploadSourceMaps || config.productionBrowserSourceMaps,
		rewrites: newRewrites,
		webpack: newWebpack,
	}
}

export const withHighlightConfig = async (
	config: NextConfigInput,
	highlightOpts?: HighlightConfigOptions,
): Promise<NextConfig> => {
	if (typeof config === 'function') {
		return async (
			phase: string,
			{ defaultConfig }: { defaultConfig: any },
		): Promise<NextConfig> => {
			const userNextConfigObject: NextConfig | Promise<NextConfig> =
				config(phase, { defaultConfig })
			if (typeof userNextConfigObject === 'function') {
				const nc = await (userNextConfigObject as Promise<NextConfig>)
				return await getHighlightConfig(nc, highlightOpts)
			} else {
				return await getHighlightConfig(
					userNextConfigObject as NextConfig,
					highlightOpts,
				)
			}
		}
	} else {
		return await getHighlightConfig(config, highlightOpts)
	}
}
