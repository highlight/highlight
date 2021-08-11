import React, { useEffect, useMemo, useState } from 'react';
import Collapsible from 'react-collapsible';

import { ReactComponent as DownIcon } from '../../../../static/chevron-down-icon.svg';
import {
    ErrorSearchParams,
    useErrorSearchContext,
} from '../../../Errors/ErrorSearchContext/ErrorSearchContext';
import SearchCountBubble from '../SearchCountBubble/SearchCountBubble';
import styles from './SearchSection.module.scss';

type SearchSectionProps = {
    title: string;
    open?: boolean;
    titleSideComponent?: React.ReactNode;
    /** The SearchParams keys that the count is based off of. */
    searchParamsKey?: (keyof ErrorSearchParams)[];
};

export const SearchSectionForErrors: React.FunctionComponent<SearchSectionProps> = ({
    children,
    title,
    open = false,
    titleSideComponent,
    searchParamsKey = [],
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(open);
    const { searchParams } = useErrorSearchContext();

    const searchCount = useMemo(
        () =>
            searchParamsKey.reduce((count, key) => {
                const searchParam = searchParams[key];

                if (Array.isArray(searchParam)) {
                    return count + searchParam.length;
                }

                if (searchParam) {
                    return count + 1;
                }

                return count;
            }, 0),
        [searchParams, searchParamsKey]
    );

    useEffect(() => {
        if (searchCount > 0) {
            setIsOpen(true);
        }
    }, [searchCount]);

    const header = (
        <div className={styles.headerWrapper}>
            <h4 className={styles.header}>
                {title}
                {titleSideComponent}
            </h4>
            {searchCount > 0 && (
                <SearchCountBubble>{searchCount}</SearchCountBubble>
            )}
            <DownIcon
                className={styles.icon}
                style={{
                    transform: !isOpen ? 'rotate(180deg)' : 'rotate(360deg)',
                }}
            />
        </div>
    );
    return (
        <div className={styles.searchSectionWrapper}>
            <Collapsible
                open={isOpen}
                onOpening={() => setIsOpen(true)}
                onClosing={() => setIsOpen(false)}
                trigger={header}
                transitionTime={150}
                style={{ margin: 10 }}
                contentOuterClassName={
                    isOpen ? styles.contentOuterOpen : styles.contentOuterClosed
                }
            >
                <div className={styles.searchSection}>{children}</div>
            </Collapsible>
        </div>
    );
};
