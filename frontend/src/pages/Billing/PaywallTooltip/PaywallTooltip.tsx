import Tooltip from '@components/Tooltip/Tooltip';
import { PlanType } from '@graph/schemas';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

export const PaywallTooltip = ({
    tier,
    children,
}: React.PropsWithChildren<{ tier: PlanType }>) => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    return (
        <Tooltip
            mouseEnterDelay={0.3}
            title={
                <a
                    href={`/w/${project_id}/billing?tier=${tier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                >
                    Enhanced user details only included with '{tier}' tier and
                    above. Click here to see upgrade options.
                </a>
            }
        >
            {children}
        </Tooltip>
    );
};
