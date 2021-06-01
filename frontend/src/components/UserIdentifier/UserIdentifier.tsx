import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { SessionPageSearchParams } from '../../pages/Player/utils/utils';

interface Props {
    session: any;
}

const UserIdentifier = ({ session }: Props) => {
    const { organization_id } = useParams<{ organization_id: string }>();

    const hasIdentifier = !!session?.identifier;

    return (
        <Link
            to={`/${organization_id}/sessions?${
                hasIdentifier
                    ? `${SessionPageSearchParams.identifier}=${session?.identifier}`
                    : `${SessionPageSearchParams.deviceId}=${session?.fingerprint}`
            }`}
        >
            {hasIdentifier
                ? session.identifier
                : `Device#${session?.fingerprint}`}
        </Link>
    );
};

export default UserIdentifier;
