import { NextConfig } from 'next'
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import HighlightWebpackPlugin from './highlightWebpackPlugin.js'
import { WebpackConfigContext } from 'next/dist/server/config-shared'

interface HighlightConfigOptionsDefault {
	uploadSourceMaps: boolean
	configureHighlightProxy: boolean
	apiKey: string
	appVersion: string
	sourceMapsPath: string
	sourceMapsBasePath: string
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
	 * File system root directory containing all your source map files.
	 * @default '.next/'
	 */
	sourceMapsPath?: string
	/**
	 * Base path to append to your source map URLs when uploaded to Highlight.
	 * @default '_next/'
	 */
	sourceMapsBasePath?: string
}

const getDefaultOpts = (
	config: NextConfig,
	highlightOpts?: HighlightConfigOptions,
): HighlightConfigOptionsDefault => {
	const isProdBuild = process.env.NODE_ENV === 'production'
	const hasSourcemapApiKey =
		!!process.env.HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY ||
		!!highlightOpts?.apiKey

	return {
		uploadSourceMaps:
			isProdBuild &&
			(highlightOpts?.uploadSourceMaps ??
				(!config.productionBrowserSourceMaps && hasSourcemapApiKey)),
		configureHighlightProxy: highlightOpts?.configureHighlightProxy ?? true,
		apiKey: highlightOpts?.apiKey ?? '',
		appVersion: highlightOpts?.appVersion ?? '',
		sourceMapsPath: highlightOpts?.sourceMapsPath ?? '.next/',
		sourceMapsBasePath: highlightOpts?.sourceMapsBasePath ?? '_next/',
	}
}

export const withHighlightConfig = (
	config: NextConfig,
	highlightOpts?: HighlightConfigOptions,
): NextConfig => {
	const defaultOpts = getDefaultOpts(config, highlightOpts)

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
