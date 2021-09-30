import Tooltip from '@components/Tooltip/Tooltip';
import classNames from 'classnames';
import React from 'react';

import { Session } from '../../graph/generated/schemas';
import { EmptySessionsSearchParams } from '../../pages/Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '../../pages/Sessions/SearchContext/SearchContext';
import Button from '../Button/Button/Button';
import styles from './UserIdentifier.module.scss';

interface Props {
    session: Session;
    className?: string;
}

const UserIdentifier = ({ session, className }: Props) => {
    const { setSearchParams } = useSearchContext();

    const hasIdentifier = !!session?.identifier;
    const displayValue = hasIdentifier
        ? session.identifier
        : `Device#${session?.fingerprint}`;

    return (
        <Tooltip title={displayValue} mouseEnterDelay={0}>
            <Button
                className={classNames(styles.button, className)}
                trackingId="UserIdentifer"
                type="text"
                onClick={() => {
                    const newSearchParams = { ...EmptySessionsSearchParams };

                    if (hasIdentifier) {
                        newSearchParams.user_properties = [
                            {
                                id: '-1',
                                name: 'contains',
                                value: session.identifier,
                            },
                        ];
                    } else if (session?.fingerprint) {
                        newSearchParams.device_id = session.fingerprint.toString();
                    }

                    setSearchParams(newSearchParams);
                }}
            >
                {displayValue}
            </Button>
        </Tooltip>
    );
};

export default UserIdentifier;
