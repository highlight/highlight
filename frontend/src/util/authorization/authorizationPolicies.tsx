import { onlyAllowAdminRole } from '@util/authorization/authorizationUtils';

/**
 * Policies for the frontend.
 * You can think of these as operations/actions a user can do.
 * The format of the key is `(entity|feature):operation`.
 */
const AUTHORIZATION_POLICIES = {
    'billing:update': onlyAllowAdminRole,
    'billing:view': onlyAllowAdminRole,
    'roles:update': onlyAllowAdminRole,
} as const;

export default AUTHORIZATION_POLICIES;
