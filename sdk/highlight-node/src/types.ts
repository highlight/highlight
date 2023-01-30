import { HighlightOptions } from 'highlight.run'

export interface NodeOptions extends HighlightOptions {
	/**
	 * ID used to associate payloads with a Highlight project.
	 */
	projectID: string
	/**
	 * Disables source code context lines for error reporting.
	 * This may be useful for performance if your source
	 * files are particularly large or memory is limited.
	 * @default false
	 */
	disableErrorSourceContext?: boolean
	/**
	 * Source files are cached in memory to speed up error reporting
	 * and avoid costly disk access. The default cache size is 10MB,
	 * but this can be overridden.
	 * Specifying a value <= 0 removes all cache size limits.
	 * @default 10
	 */
	errorSourceContextCacheSizeMB?: number
}
