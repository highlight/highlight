import React from 'react';

import { Admin } from './graph/generated/schemas';

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
    return AuthRole[role].startsWith('AUTHENTICATED');
};

export const isHighlightAdmin = (role: AuthRole) => {
    return role == AuthRole.AUTHENTICATED_HIGHLIGHT;
};

export const AuthContext = React.createContext<{
    role: AuthRole;
    admin?: Admin;
    isAuthLoading: boolean;
    isLoggedIn: boolean;
    isHighlightAdmin: boolean;
}>({
    role: AuthRole.LOADING,
    admin: undefined,
    isAuthLoading: true,
    isLoggedIn: false,
    isHighlightAdmin: false,
});
