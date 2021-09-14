import { isOnPrem } from '@util/onPrem/onPremUtils';
import classNames from 'classnames';
import React from 'react';

import { ReactComponent as EmptyState } from '../../static/empty-state.svg';
import {
    emptyStateSection,
    emptyStateWrapper,
    emptySubTitle,
    emptyTitle,
} from './SearchEmptyState.module.scss';
import styles from './SearchEmptyState.module.scss';

export const SearchEmptyState = ({
    item,
    newFeed,
}: {
    item: string;
    newFeed?: boolean;
}) => (
    <div
        className={classNames({
            [styles.newFeedStyles]: newFeed,
        })}
    >
        <div className={emptyStateWrapper}>
            <div style={{ marginRight: 80 }} className={emptyStateSection}>
                <EmptyState preserveAspectRatio="xMinYMin" />
            </div>
            <div style={{ marginLeft: 80 }} className={emptyStateSection}>
                <EmptyState preserveAspectRatio="xMinYMin" />
            </div>
            <div style={{ marginRight: 80 }} className={emptyStateSection}>
                <EmptyState preserveAspectRatio="xMinYMin" />
            </div>
        </div>
        <h3 className={emptyTitle}>Couldn't find any relevant {item} 😔</h3>
        <p className={emptySubTitle}>
            We couldn't find any {item} for your search.{' '}
            {!isOnPrem ? (
                <>
                    If you think something's wrong, feel free to message us on{' '}
                    <span
                        className={styles.intercomButton}
                        onClick={() =>
                            window.Intercom('update', {
                                hide_default_launcher: false,
                            })
                        }
                    >
                        Intercom
                    </span>
                    .
                </>
            ) : (
                <>
                    If you think something's wrong, feel free to reach out to
                    us!
                </>
            )}
        </p>
    </div>
);
