import React from 'react';
import styles from './Home.module.scss';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { ReactComponent as Humans } from '../../static/human-image.svg';
import { ReactComponent as Logos } from '../../static/logos.svg';

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
                    Understand your app, with clarity.
                </div>
                <div className={styles.subHeader}>
                    Frontend observability for the modern web.
                </div>
                <Humans className={styles.humans} />
                <div className={styles.logoHeader}>
                    Highlight powers forward thinking companies.
                </div>
                <Logos className={styles.logos} />
            </div>
            <div className={styles.contentWrapper}>{children}</div>
        </div>
    );
};
