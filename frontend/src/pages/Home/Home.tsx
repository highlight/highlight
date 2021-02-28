import React from 'react';
import styles from './Home.module.scss';
import { ReactComponent as Humans } from '../../static/human-image.svg';
import { ReactComponent as Logos } from '../../static/logos.svg';
import { HighlightLogo } from '../../components/HighlightLogo/HighlightLogo';
import { Link } from 'react-router-dom';

export const Home = ({
    children,
}: React.PropsWithChildren<Record<string, unknown>>) => {
    return (
        <div className={styles.homePageWrapper}>
            <div className={styles.stylingWrapper}>
                <div className={styles.nav}>
                    <HighlightLogo />
                    <div style={{ marginLeft: 'auto' }}>
                        <Link
                            to={{ pathname: 'https://docs.highlight.run' }}
                            target="_blank"
                            className={styles.navLink}
                        >
                            Documentation
                        </Link>
                        <Link to={'/careers'} className={styles.navLink}>
                            Careers
                        </Link>
                    </div>
                </div>
                <div className={styles.landingWrapper}>
                    <div className={styles.landing}>
                        <div className={styles.header}>
                            Understand your app, with clarity.
                        </div>
                        <div className={styles.subHeader}>
                            Get full transparency into the errors, interactions,
                            and performance metrics on your frontend.
                        </div>
                        <Humans className={styles.humans} />
                        <div className={styles.logoHeader}>
                            Highlight powers forward thinking companies.
                        </div>
                        <Logos className={styles.logos} />
                    </div>
                </div>
                <div className={styles.securityNav}>
                    <div className={styles.securityWrapper}>
                        <Link
                            to={{
                                pathname:
                                    'https://www.highlight.run/terms-of-service ',
                            }}
                            target="_blank"
                            className={styles.securityLink}
                        >
                            Terms of service
                        </Link>
                        <Link
                            to={{
                                pathname: 'https://www.highlight.run/privacy',
                            }}
                            target="_blank"
                            className={styles.securityLink}
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
            <div className={styles.contentWrapper}>{children}</div>
        </div>
    );
};
