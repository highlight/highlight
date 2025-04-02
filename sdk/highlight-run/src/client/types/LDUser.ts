/**
 * A LaunchDarkly user object.
 *
 * @deprecated
 */
export interface LDUser {
  /**
   * A unique string identifying a user.
   */
  key: string;

  /**
   * The user's name.
   *
   * You can search for users on the User page by name.
   */
  name?: string;

  /**
   * The user's first name.
   */
  firstName?: string;

  /**
   * The user's last name.
   */
  lastName?: string;

  /**
   * The user's email address.
   *
   * If an `avatar` URL is not provided, LaunchDarkly will use Gravatar
   * to try to display an avatar for the user on the Users page.
   */
  email?: string;

  /**
   * An absolute URL to an avatar image for the user.
   */
  avatar?: string;

  /**
   * The user's IP address.
   */
  ip?: string;

  /**
   * The country associated with the user.
   */
  country?: string;

  /**
   * If true, the user will _not_ appear on the Users page in the LaunchDarkly dashboard.
   */
  anonymous?: boolean;

  /**
   * Any additional attributes associated with the user.
   */
  custom?: {
    [key: string]: string | boolean | number | Array<string | boolean | number>;
  };

  /**
   * Specifies a list of attribute names (either built-in or custom) which should be
   * marked as private, and not sent to LaunchDarkly in analytics events. This is in
   * addition to any private attributes designated in the global configuration
   * with {@link LDOptions.privateAttributes} or {@link LDOptions.allAttributesPrivate}.
   */
  privateAttributeNames?: Array<string>;
}
