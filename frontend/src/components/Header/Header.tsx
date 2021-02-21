import React, { useEffect, useContext } from 'react';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { ReactComponent as Banner } from '../../static/banner.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { Link, withRouter } from 'react-router-dom';
import { useParams, RouteComponentProps } from 'react-router-dom';
import { UserDropdown } from './UserDropdown/UserDropdown';
import * as Mousetrap from 'mousetrap';

import styles from './Header.module.scss';
import { DemoContext } from '../../DemoContext';
import { SidebarContext } from '../Sidebar/SidebarContext';
import classNames from 'classnames/bind';
import { Duration } from '../../util/time';

type HeaderProps = {
    trialTimeRemaining?: Duration;
};

const Head: React.FunctionComponent<RouteComponentProps & HeaderProps> = ({
    history,
    ...props
}) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { demo } = useContext(DemoContext);
    const { setOpenSidebar, openSidebar } = useContext(SidebarContext);
    const { trialTimeRemaining } = props;

    useEffect(() => {
        const keys = ['command+k', 'ctrl+k'];
        const method = () => {
            history.push(`/${organization_id}/sessions`);
        };

        // @ts-ignore
        Mousetrap.bind(keys, method);

        return () => {
            // @ts-ignore
            Mousetrap.unbind(keys, method);
        };
    }, [history, organization_id]);

    return (
        <>
            <div className={styles.header}>
                {trialTimeRemaining && (
                    <TrialBanner timeRemaining={trialTimeRemaining} />
                )}
                <div className={styles.headerContent}>
                    <div className={styles.logoWrapper}>
                        <Hamburger
                            className={styles.hamburger}
                            onClick={() => {
                                setOpenSidebar(!openSidebar);
                            }}
                            style={{
                                transform: openSidebar
                                    ? 'rotate(-180deg)'
                                    : 'rotate(0deg)',
                            }}
                        />
                        <Link
                            className={styles.homeLink}
                            to={demo ? '/' : `/${organization_id}/sessions`}
                        >
                            <HighlightLogoSmall className={styles.logo} />
                            <span className={styles.logoText}>Highlight</span>
                        </Link>
                    </div>
                    <div className={styles.rightHeader}>
                        <UserDropdown />
                    </div>
                </div>
            </div>
        </>
    );
};

const TrialBanner = ({ timeRemaining }: { timeRemaining: Duration }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    return (
        <div className={styles.trialWrapper}>
            <Banner className={styles.bannerSvg} />
            <div className={classNames(styles.trialTimeText)}>
                {timeRemaining.days}&nbsp;day(s) left in your trial. Pick a plan{' '}
                <Link
                    className={styles.trialLink}
                    to={`/${organization_id}/billing`}
                >
                    here!
                </Link>
            </div>
        </div>
    );
};

export const Header = withRouter(Head);
