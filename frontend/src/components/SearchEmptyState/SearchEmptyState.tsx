import React from 'react';

import {
    emptyStateSection,
    emptyStateWrapper,
    emptyTitle,
    emptySubTitle,
} from './SearchEmptyState.module.scss';

import { ReactComponent as EmptyState } from '../../static/empty-state.svg';

export const SearchEmptyState = ({ item }: { item: string }) => (
    <div className={emptyStateWrapper}>
        <div style={{ marginRight: 80 }} className={emptyStateSection}>
            <EmptyState
                height={30}
                width={220}
                preserveAspectRatio="xMinYMin"
            />
        </div>
        <div style={{ marginLeft: 80 }} className={emptyStateSection}>
            <EmptyState
                height={30}
                width={220}
                preserveAspectRatio="xMinYMin"
            />
        </div>
        <div style={{ marginRight: 80 }} className={emptyStateSection}>
            <EmptyState
                height={30}
                width={220}
                preserveAspectRatio="xMinYMin"
            />
        </div>
        <h1 className={emptyTitle}>Couldn't find any relevant {item} 😔</h1>
        <h3 className={emptySubTitle}>
            We couldn't find any {item} for your search. If you think
            something's wrong, feel free to message us on intercom.
        </h3>
    </div>
);
