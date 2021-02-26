import React from 'react';
import styles from './Home.module.scss';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { ReactComponent as Humans } from '../../static/human-image.svg';

export const Home = ({
    children,
}: React.PropsWithChildren<Record<string, unknown>>) => {
    return (
        <div className={styles.homePageWrapper}>
            <div className={styles.stylingWrapper}>
                <div className={styles.nav}>
                    <HighlightLogoSmall />
                </div>
                <div className={styles.header}>
                    Introducing&nbsp;
                    <span className={styles.purpleText}>Highlight.</span>
                </div>
                <div className={styles.subHeader}>
                    Frontend observability for the modern web.
                </div>
                <Humans />
                <div className={styles.logoHeader}>
                    Highlight powers forward thinking companies.
                </div>
            </div>
            <div className={styles.contentWrapper}>{children}</div>
        </div>
    );
};
