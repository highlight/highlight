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
import { TopSearchBar } from './TopSearchBar/TopSearchBar';
import { gql, useQuery } from '@apollo/client';

type HeaderProps = {
    trialTimeRemaining?: Duration;
}

const Head: React.FunctionComponent<RouteComponentProps & HeaderProps> = ({ history, ...props }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { demo } = useContext(DemoContext);
    const { setOpenSidebar, openSidebar } = useContext(SidebarContext);
    const { trialTimeRemaining } = props;

    const { refetch } = useQuery<{ user_field_suggestion: Array<{ name: string; value: string }> }, { organization_id: number; query: string }>(
        gql`
            query GetUserFieldSuggestion($organization_id: ID!, $query: String!) {
                user_field_suggestion(organization_id: $organization_id, query: $query) {
                    name
                    value
                }
            }
        `, { skip: true });


    React.useEffect(() => {
        window.CommandBar.addRouter((newUrl: any) => {
            console.log(newUrl);
            console.log(history);
            history.push(newUrl)
        });
        window.CommandBar.addSearch("user_field_suggestion", async (input: string) => {
            const val = await refetch({ query: input, organization_id: parseInt(organization_id) })
            return val.data.user_field_suggestion;
        })
    }, [])

    return (
        <>
            <div className={styles.header}>
                {trialTimeRemaining && <TrialBanner timeRemaining={trialTimeRemaining} />}
                <div className={styles.headerContent}>
                    <div className={styles.logoWrapper}>
                        <Hamburger
                            className={styles.hamburger}
                            onClick={() => {
                                setOpenSidebar(!openSidebar)
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
                        <TopSearchBar />
                    </div>
                    <div className={styles.rightHeader}>
                        <UserDropdown />
                    </div>
                </div>
            </div>
            <div className={styles.headerPlaceholder} />
        </>
    );
};



const TrialBanner = ({ timeRemaining }: { timeRemaining: Duration }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    return (
        <div className={styles.trialWrapper} >
            <Banner className={styles.bannerSvg} />
            <div className={classNames(styles.trialTimeText)}>
                {timeRemaining.days}&nbsp;day(s) left in your trial. Pick a plan <Link className={styles.trialLink} to={`/${organization_id}/billing`}>here!</Link>
            </div>
        </div >
    )
}

export const Header = withRouter(Head);
