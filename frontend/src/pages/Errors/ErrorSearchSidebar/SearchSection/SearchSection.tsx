import React, { useContext, useMemo, useState } from 'react';
import Collapsible from 'react-collapsible';
import { ReactComponent as DownIcon } from '../../../../static/chevron-down.svg';
import {
    ErrorSearchContext,
    ErrorSearchParams,
} from '../../ErrorSearchContext/ErrorSearchContext';
import SearchCountBubble from '../../../Sessions/SearchSidebar/SearchCountBubble/SearchCountBubble';
import styles from './SearchSection.module.scss';

type SearchSectionProps = {
    title: string;
    open: boolean;
    titleSideComponent?: React.ReactNode;
    /** The ErrorSearchParams keys that the count is based off of. */
    searchParamsKey?: (keyof ErrorSearchParams)[];
};

export const SearchSection: React.FunctionComponent<SearchSectionProps> = ({
    children,
    title,
    open,
    titleSideComponent,
    searchParamsKey = [],
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(open);
    const { errorSearchParams } = useContext(ErrorSearchContext);

    const searchCount = useMemo(
        () =>
            searchParamsKey.reduce((count, key) => {
                const searchParam = errorSearchParams[key];

                if (Array.isArray(searchParam)) {
                    return count + searchParam.length;
                }

                if (searchParam) {
                    return count + 1;
                }

                return count;
            }, 0),
        [errorSearchParams, searchParamsKey]
    );

    const header = (
        <div className={styles.headerWrapper}>
            <div className={styles.header}>
                {title}
                {titleSideComponent}
            </div>
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
                open={open}
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
