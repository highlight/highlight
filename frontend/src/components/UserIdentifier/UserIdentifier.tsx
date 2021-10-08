import Tooltip from '@components/Tooltip/Tooltip';
import classNames from 'classnames';
import { H } from 'highlight.run';
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

// Fallback logic for the display name shown for the session card
const getDisplayName = (session: Session) => {
    let userProperties;
    try {
        userProperties = JSON.parse(session?.user_properties || '{}');
    } catch (e) {
        if (e instanceof Error) {
            H.consumeError(e);
        }
    }

    return (
        userProperties?.highlightDisplayName ||
        userProperties?.email ||
        session?.identifier ||
        (session?.fingerprint && `#${session?.fingerprint}`) ||
        'unidentified'
    );
};

const UserIdentifier = ({ session, className }: Props) => {
    const { setSearchParams } = useSearchContext();

    const hasIdentifier = !!session?.identifier;
    const displayValue = getDisplayName(session);

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
