import { useEffect, useState } from 'react';

import { useGetAdminQuery } from '../../graph/generated/hooks';

/**
 * Returns true if the current user is a '@highlight.run'. This should be used to gate features that should only be accessible to Highlight employees.
 */
const useHighlightAdminFlag = () => {
    const { data } = useGetAdminQuery({
        skip: false,
    });
    const [isHighlightAdmin, setIsHighlightAdmin] = useState(false);

    useEffect(() => {
        if (data) {
            if (data.admin?.email.includes('@highlight.run')) {
                setIsHighlightAdmin(true);
            } else {
                setIsHighlightAdmin(false);
            }
        }
    }, [data]);

    return { isHighlightAdmin };
};

export default useHighlightAdminFlag;
