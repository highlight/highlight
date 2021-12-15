import {
    onlyAllowAdminRole,
    onlyAllowHighlightStaff,
} from '@util/authorization/authorizationUtils';

/**
 * Policies for the frontend.
 * You can think of these as operations/actions a user can do.
 */
export enum POLICY_NAMES {
    BillingUpdate,
    BillingView,
    RolesUpdate,
    IntegrationsUpdate,
}
const AUTHORIZATION_POLICIES = {
    [POLICY_NAMES.BillingUpdate]: onlyAllowAdminRole,
    [POLICY_NAMES.BillingView]: onlyAllowAdminRole,
    [POLICY_NAMES.RolesUpdate]: onlyAllowAdminRole,
    [POLICY_NAMES.IntegrationsUpdate]: onlyAllowHighlightStaff,
} as const;

export default AUTHORIZATION_POLICIES;
