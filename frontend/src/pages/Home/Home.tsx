import React from 'react';
import styles from './Home.module.scss';
import { ReactComponent as Humans } from '../../static/human-image.svg';
import { ReactComponent as Logos } from '../../static/logos.svg';
import { ReactComponent as ArrowRight } from '../../static/arrow-right.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { HighlightLogo } from '../../components/HighlightLogo/HighlightLogo';
import { Link } from 'react-router-dom';
import { Dropdown } from 'antd';

export const Home: React.FC = ({ children }) => {
    const width = window.innerWidth;
    return (
        <div className={styles.homePageWrapper}>
            <div className={styles.stylingWrapper}>
                <nav className={styles.nav}>
                    <HighlightLogo />
                    <div style={{ marginLeft: 'auto' }}>
                        {width <= 1000 ? (
                            <Dropdown
                                overlay={
                                    <div className={styles.overlayWrapper}>
                                        <Link
                                            to={{
                                                pathname:
                                                    'https://docs.highlight.run',
                                            }}
                                            target="_blank"
                                        >
                                            Documentation
                                        </Link>
                                        <Link to={'/about/careers'}>
                                            Careers
                                        </Link>
                                        <a href="https://app.highlight.run">
                                            Sign In
                                        </a>
                                    </div>
                                }
                                placement={'bottomRight'}
                            >
                                <Hamburger
                                    style={{
                                        height: 25,
                                        width: 25,
                                        marginRight: 10,
                                    }}
                                />
                            </Dropdown>
                        ) : (
                            <>
                                <Link
                                    to={{
                                        pathname: 'https://docs.highlight.run',
                                    }}
                                    target="_blank"
                                    className={styles.navLink}
                                >
                                    Documentation
                                </Link>
                                <Link
                                    to={'/about/careers'}
                                    className={styles.navLink}
                                >
                                    Careers
                                </Link>
                                <a
                                    href="https://app.highlight.run"
                                    className={styles.arrowWrapper}
                                >
                                    Sign In{' '}
                                    <ArrowRight className={styles.arrow} />
                                </a>
                            </>
                        )}
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
