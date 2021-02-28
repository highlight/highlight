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
                <nav className={styles.nav}>
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
                </nav>
                <div className={styles.landingWrapper}>
                    <div className={styles.landing}>
                        <h2 className={styles.header}>
                            Understand your app, with clarity.
                        </h2>
                        <h3 className={styles.subHeader}>
                            Get full transparency into the errors, interactions,
                            and performance metrics on your frontend.
                        </h3>
                        <Humans className={styles.humans} />
                        <p className={styles.logoHeader}>
                            Highlight powers forward thinking companies.
                        </p>
                        <Logos className={styles.logos} />
                    </div>
                </div>
                <footer className={styles.securityNav}>
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
                </footer>
            </div>
            <div className={styles.contentWrapper}>{children}</div>
        </div>
    );
};
