import { LDMultiKindContext } from './LDMultiKindContext';
import { LDSingleKindContext } from './LDSingleKindContext';
import { LDUser } from './LDUser';

/**
 * A LaunchDarkly context object.  LaunchDarkly contexts are objects representing users, devices, organizations, and
 * other entities that feature flags serve different variations to according to your flag targeting rules. These data
 * objects contain context attributes that describe what you know about that context, such as their name, location,
 * device type, or organization they are associated with.
 *
 * You can manage how contexts interact with your app by targeting flag variations to specific contexts, based on
 * their context attributes. When a flag evaluation occurs, the feature flag uses the evaluation context to understand
 * what variation to serve. You can be as specific as targeting a flag to a single end context, or as broad as targeting
 * your entire customer base. You can even use anonymous contexts and private attributes to control what data to
 * include or exclude in the information you collect about your end users.
 *
 * LDContext is the newer replacement for the previous, less flexible LDUser type. The current SDK still supports
 * LDUser, but LDContext is now the preferred model.
 *
 * See {@link LDSingleKindContext} and {@link LDMultiKindContext} for examples.  {@link LDContextCommon} includes
 * additional propert
 */
export type LDContext = LDUser | LDSingleKindContext | LDMultiKindContext;
