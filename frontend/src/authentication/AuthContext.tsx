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

export const isLiveModeExposed = (isHighlightAdmin: boolean, admin?: Admin) => {
    return (
        isHighlightAdmin ||
        ['251', '261', '937', '939'].includes(admin?.id || '0')
    );
};

export const [useAuthContext, AuthContextProvider] = createContext<{
    role: AuthRole;
    admin?: Admin;
    isAuthLoading: boolean;
    isLoggedIn: boolean;
    isHighlightAdmin: boolean;
}>('AuthContext');
