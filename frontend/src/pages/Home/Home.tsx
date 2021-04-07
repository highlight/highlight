import React, { useEffect, useState } from 'react';
import styles from './Home.module.scss';
import { ReactComponent as Humans } from '../../static/human-image.svg';
import { ReactComponent as Logos } from '../../static/logos.svg';
import { ReactComponent as ArrowRight } from '../../static/arrow-right.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { HighlightLogo } from '../../components/HighlightLogo/HighlightLogo';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Dropdown } from 'antd';
import Modal from '../../components/Modal/Modal';

const DEMO_VIDEO_URL =
    'https://highlight-demo-video.s3-us-west-2.amazonaws.com/v2/v2.6.mp4';

const HomeInternal: React.FC<RouteComponentProps> = ({ children }) => {
    const width = window.innerWidth;
    const url = window.location.href;
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        if (url.includes('demo')) {
            setShowVideo(true);
        }
    }, [url]);

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
                <Modal
                    visible={showVideo}
                    onCancel={() => setShowVideo(false)}
                    forceRender
                    modalRender={() => (
                        <div className={styles.modalWrapper}>
                            <video
                                controls
                                src={DEMO_VIDEO_URL}
                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                        </div>
                    )}
                ></Modal>
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
                            to={'/about/terms'}
                            className={styles.securityLink}
                        >
                            Terms of service
                        </Link>
                        <Link
                            to={'/about/privacy'}
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

export const Home = withRouter(HomeInternal);
