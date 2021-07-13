import { useEffect, useState } from 'react';

import { useGetAdminQuery } from '../../graph/generated/hooks';

export enum AdminRole {
    HIGHLIGHT_ADMIN,
    AUTH_ADMIN,
    ANONYMOUS_ADMIN,
}

/**
 * Returns true if the current user is a '@highlight.run'. This should be used to gate features that should only be accessible to Highlight employees.
 */
const useAdminRole = () => {
    const { data } = useGetAdminQuery({
        skip: false,
    });
    const [adminRole, setAdminRole] = useState(AdminRole.ANONYMOUS_ADMIN);

    useEffect(() => {
        if (data) {
            if (data.admin?.email.includes('@highlight.run')) {
                setAdminRole(AdminRole.HIGHLIGHT_ADMIN);
            } else if (data.admin) {
                setAdminRole(AdminRole.AUTH_ADMIN);
            }
        }
    }, [data]);

    const isHighlightAdmin = adminRole === AdminRole.HIGHLIGHT_ADMIN;

    return { adminRole, isHighlightAdmin };
};

export default useAdminRole;
