/**
 * Meta attributes are used to control behavioral aspects of the Context.
 * They cannot be addressed in targeting rules.
 */
export interface LDContextMeta {
	/**
	 *
	 * Designate any number of Context attributes, or properties within them, as private: that is,
	 * their values will not be sent to LaunchDarkly.
	 *
	 * Each parameter can be a simple attribute name, such as "email". Or, if the first character is
	 * a slash, the parameter is interpreted as a slash-delimited path to a property within a JSON
	 * object, where the first path component is a Context attribute name and each following
	 * component is a nested property name: for example, suppose the attribute "address" had the
	 * following JSON object value:
	 *
	 * ```
	 * {"street": {"line1": "abc", "line2": "def"}}
	 * ```
	 *
	 * Using ["/address/street/line1"] in this case would cause the "line1" property to be marked as
	 * private. This syntax deliberately resembles JSON Pointer, but other JSON Pointer features
	 * such as array indexing are not supported for Private.
	 *
	 * This action only affects analytics events that involve this particular Context. To mark some
	 * (or all) Context attributes as private for all users, use the overall configuration for the
	 * SDK.
	 * See {@link LDOptions.allAttributesPrivate} and {@link LDOptions.privateAttributes}.
	 *
	 * The attributes "kind" and "key", and the "_meta" attributes cannot be made private.
	 *
	 * In this example, firstName is marked as private, but lastName is not:
	 *
	 * ```
	 * const context = {
	 *   kind: 'org',
	 *   key: 'my-key',
	 *   firstName: 'Pierre',
	 *   lastName: 'Menard',
	 *   _meta: {
	 *     privateAttributes: ['firstName'],
	 *   }
	 * };
	 * ```
	 *
	 * This is a metadata property, rather than an attribute that can be addressed in evaluations:
	 * that is, a rule clause that references the attribute name "privateAttributes", will not use
	 * this value, but would use a "privateAttributes" attribute set on the context.
	 */
	privateAttributes?: string[]
}
