import { Admin } from '../graph/generated/schemas';
import { createContext } from '../util/context/context';

export enum AuthRole {
    AUTHENTICATED_HIGHLIGHT, // A highlight staff member
    AUTHENTICATED, // Any authenticated user
    UNAUTHENTICATED,
    LOADING,
}

export const isAuthLoading = (role: AuthRole) => {
    return role == AuthRole.LOADING;
};

export const isLoggedIn = (role: AuthRole) => {
    return [AuthRole.AUTHENTICATED_HIGHLIGHT, AuthRole.AUTHENTICATED].includes(
        role
    );
};

export const isHighlightAdmin = (role: AuthRole) => {
    return role == AuthRole.AUTHENTICATED_HIGHLIGHT;
};

export const queryBuilderEnabled = (
    isHighlightAdmin: boolean,
    project_id: string
) => {
    // Projects can be enabled on a one-off basis by adding to the list below:
    return isHighlightAdmin || ['1', '162', '120', '493'].includes(project_id);
};

export const [useAuthContext, AuthContextProvider] = createContext<{
    role: AuthRole;
    admin?: Admin;
    isAuthLoading: boolean;
    isLoggedIn: boolean;
    isHighlightAdmin: boolean;
}>('AuthContext');
