import { LDContextCommon } from './LDContextCommon'

/**
 * A context which represents a single kind.
 *
 * For a single kind context the 'kind' may not be 'multi'.
 *
 * ```
 * const myOrgContext = {
 *   kind: 'org',
 *   key: 'my-org-key',
 *   someAttribute: 'my-attribute-value'
 * };
 * ```
 *
 * The above context would be a single kind context representing an organization. It has a key
 * for that organization, and a single attribute 'someAttribute'.
 */
export interface LDSingleKindContext extends LDContextCommon {
	/**
	 * The kind of the context.
	 */
	kind: string
}
