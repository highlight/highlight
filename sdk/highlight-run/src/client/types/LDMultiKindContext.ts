import { LDContextCommon } from './LDContextCommon'

/**
 * A context which represents multiple kinds. Each kind having its own key and attributes.
 *
 * A multi-context must contain `kind: 'multi'` at the root.
 *
 * ```
 * const myMultiContext = {
 *   // Multi-contexts must be of kind 'multi'.
 *   kind: 'multi',
 *   // The context is namespaced by its kind. This is an 'org' kind context.
 *   org: {
 *     // Each component context has its own key and attributes.
 *     key: 'my-org-key',
 *     someAttribute: 'my-attribute-value',
 *   },
 *   user: {
 *     key: 'my-user-key',
 *     firstName: 'Bob',
 *     lastName: 'Bobberson',
 *     _meta: {
 *       // Each component context has its own _meta attributes. This will only apply the this
 *       // 'user' context.
 *       privateAttributes: ['firstName']
 *     }
 *   }
 * };
 * ```
 *
 * The above multi-context contains both an 'org' and a 'user'. Each with their own key,
 * attributes, and _meta attributes.
 */
export interface LDMultiKindContext {
	/**
	 * The kind of the context.
	 */
	kind: 'multi'

	/**
	 * The contexts which compose this multi-kind context.
	 *
	 * These should be of type LDContextCommon. "multi" is to allow
	 * for the top level "kind" attribute.
	 */
	[kind: string]: 'multi' | LDContextCommon
}
