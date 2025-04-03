import { LDContextMeta } from './LDContextMeta';

/**
 * Common attributes shared by the various context types.
 */
export interface LDContextCommon {
  /**
   * A unique string identifying a context.
   */
  key: string;

  /**
   * The context's name.
   *
   * You can search for contexts on the Contexts page by name.
   */
  name?: string;

  /**
   * Meta attributes are used to control behavioral aspects of the Context, such as private
   * private attributes. See {@link LDContextMeta.privateAttributes} as an example.
   *
   * They cannot be addressed in targeting rules.
   */
  _meta?: LDContextMeta;

  /**
   * If true, the context will _not_ appear on the Contexts page in the LaunchDarkly dashboard.
   */
  anonymous?: boolean;

  /**
   * Any additional attributes associated with the context.
   */
  [attribute: string]: any;
}
