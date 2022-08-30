import Tooltip from '@components/Tooltip/Tooltip';
import SvgCopyIcon from '@icons/CopyIcon';
import SvgSearchIcon from '@icons/SearchIcon';
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import { getDisplayNameAndField } from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils';
import { message } from 'antd';
import classNames from 'classnames';
import React, { useCallback } from 'react';

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
    const { setShowLeftPanel } = usePlayerConfiguration();

    const hasIdentifier = !!session?.identifier;
    const [displayValue, field] = getDisplayNameAndField(session);

    const searchIdentifier = useCallback(() => {
        const newSearchParams = {
            ...EmptySessionsSearchParams,
        };

        if (hasIdentifier && field !== null) {
            newSearchParams.user_properties = [
                {
                    id: '0',
                    name: field,
                    value: displayValue,
                },
            ];
        } else if (session?.fingerprint) {
            newSearchParams.device_id = session.fingerprint.toString();
        }

        setSearchParams(newSearchParams);
        setShowLeftPanel(true);
    }, [
        displayValue,
        field,
        hasIdentifier,
        session.fingerprint,
        setSearchParams,
        setShowLeftPanel,
    ]);
    return (
        <div className={classNames(styles.identifierContainer, className)}>
            <Button
                className={styles.identifierButton}
                trackingId="UserIdentifer"
                type="text"
                onClick={searchIdentifier}
            >
                {displayValue}
            </Button>
            <Tooltip
                title={'Copy id to clipboard'}
                mouseEnterDelay={0}
                align={{ offset: [0, 3] }}
            >
                <Button
                    className={styles.identifierActionButton}
                    trackingId="UserIdentiferSearch"
                    iconButton
                    type="text"
                    onClick={() => {
                        navigator.clipboard.writeText(displayValue);
                        message.success(
                            `Copied identifier ${displayValue} to clipboard!`
                        );
                    }}
                >
                    <SvgCopyIcon />
                </Button>
            </Tooltip>
            <Tooltip
                title={'Find all user sessions'}
                mouseEnterDelay={0}
                align={{ offset: [0, 3] }}
            >
                <Button
                    className={classNames(
                        styles.identifierActionButton,
                        styles.identifierSearchButton
                    )}
                    trackingId="UserIdentiferSearch"
                    iconButton
                    type="text"
                    onClick={searchIdentifier}
                >
                    <SvgSearchIcon />
                </Button>
            </Tooltip>
        </div>
    );
};

export default UserIdentifier;
