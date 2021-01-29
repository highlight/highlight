import React, { useState } from 'react';
import Collapsible from 'react-collapsible';
import { ReactComponent as DownIcon } from '../../../../static/chevron-down.svg';
import styles from './SearchSection.module.scss';

type SearchSectionProps = {
    title: string;
    open: boolean;
    titleSideComponent?: React.ReactNode;
};

export const SearchSection: React.FunctionComponent<SearchSectionProps> = ({
    children,
    title,
    open,
    titleSideComponent,
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(open);
    const header = (
        <div className={styles.headerWrapper}>
            <div className={styles.header}>
                {title}
                {titleSideComponent}
            </div>
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
