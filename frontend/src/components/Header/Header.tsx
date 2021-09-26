import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import SvgXIcon from '@icons/XIcon';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames/bind';
import { H } from 'highlight.run';
import moment from 'moment';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSessionStorage } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import { Maybe, PlanType, Project } from '../../graph/generated/schemas';
import { ReactComponent as Banner } from '../../static/banner.svg';
import { isProjectWithinTrial } from '../../util/billing/billing';
import { HighlightLogo } from '../HighlightLogo/HighlightLogo';
import { CommandBar } from './CommandBar/CommandBar';
import ApplicationPicker from './components/ApplicationPicker/ApplicationPicker';
import FeedbackButton from './components/FeedbackButton/FeedbackButton';
import HeaderActions from './components/HeaderActions';
import styles from './Header.module.scss';
import { UserDropdown } from './UserDropdown/UserDropdown';

export const Header = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;
    const { isLoggedIn } = useAuthContext();

    return (
        <>
            <CommandBar />
            <div
                className={classNames(styles.header, {
                    [styles.guest]: !isLoggedIn,
                })}
            >
                {getBanner(project_id)}

                <div className={styles.headerContent}>
                    {isLoggedIn ? (
                        <div className={styles.applicationPickerContainer}>
                            <ApplicationPicker />
                        </div>
                    ) : (
                        <div className={styles.logoWrapper}>
                            <Link
                                className={styles.homeLink}
                                to={`/${projectIdRemapped}/home`}
                            >
                                <HighlightLogo />
                            </Link>
                        </div>
                    )}

                    <div className={styles.rightHeader}>
                        <HeaderActions />
                        <FeedbackButton />
                        {isLoggedIn && <UserDropdown />}
                    </div>
                </div>
            </div>
        </>
    );
};

const getBanner = (project_id: string) => {
    if (isOnPrem) {
        return <OnPremiseBanner />;
    } else if (project_id === DEMO_WORKSPACE_APPLICATION_ID) {
        return <DemoWorkspaceBanner />;
    } else {
        return <FreePlanBanner />;
    }
};

const FreePlanBanner = () => {
    const [temporarilyHideBanner, setTemporarilyHideBanner] = useSessionStorage(
        'highlightHideFreePlanBanner',
        false
    );
    const { project_id } = useParams<{ project_id: string }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;
    const { data, loading } = useGetBillingDetailsQuery({
        variables: { project_id },
    });

    if (loading) {
        return null;
    }

    if (data?.billingDetails.plan.type !== PlanType.Free) {
        return null;
    }

    if (project_id === DEMO_WORKSPACE_APPLICATION_ID) {
        return null;
    }

    if (temporarilyHideBanner) {
        return null;
    }

    let bannerMessage = `You've used ${data?.billingDetails.meter}/${data?.billingDetails.plan.quota} of your free sessions.`;
    const hasTrial = isProjectWithinTrial(data?.project);
    if (hasTrial) {
        bannerMessage = `You have unlimited sessions until ${moment(
            data?.project?.trial_end_date
        ).format('MM/DD/YY')}. `;
    }

    return (
        <div className={styles.trialWrapper}>
            <Banner className={styles.bannerSvg} />
            <div className={classNames(styles.trialTimeText)}>
                {bannerMessage + ' '} Upgrade{' '}
                <Link
                    className={styles.trialLink}
                    to={`/${projectIdRemapped}/billing`}
                >
                    here!
                </Link>
            </div>
            {hasTrial && (
                <button
                    onClick={() => {
                        H.track('TemporarilyHideFreePlanBanner', {
                            hasTrial,
                        });
                        setTemporarilyHideBanner(true);
                    }}
                >
                    <SvgXIcon />
                </button>
            )}
        </div>
    );
};

const OnPremiseBanner = () => {
    return (
        <div
            className={styles.trialWrapper}
            style={{
                backgroundColor: 'var(--color-primary-inverted-background)',
            }}
        >
            <Banner
                className={styles.bannerSvg}
                style={{ fill: 'var(--text-primary)' }}
            />
            <div className={classNames(styles.trialTimeText)}>
                Running Highlight On-premise{' '}
                {`v${process.env.REACT_APP_COMMIT_SHA}`}
            </div>
        </div>
    );
};

const DemoWorkspaceBanner = () => {
    const { currentApplication, allApplications } = useApplicationContext();
    const { pathname } = useLocation();

    const redirectLink = getRedirectLink(
        allApplications,
        currentApplication,
        pathname
    );

    return (
        <div
            className={styles.trialWrapper}
            style={{
                background: 'var(--color-primary-inverted-background)',
            }}
        >
            <Banner
                className={styles.bannerSvg}
                style={{ fill: 'var(--color-primary-inverted-background)' }}
            />
            <div className={classNames(styles.trialTimeText)}>
                Viewing Demo Project.{' '}
                <Link className={styles.demoLink} to={redirectLink}>
                    Go back to your project.
                </Link>
            </div>
        </div>
    );
};

const getRedirectLink = (
    allProjects: Maybe<
        Maybe<
            {
                __typename?: 'Project' | undefined;
            } & Pick<Project, 'id' | 'name'>
        >[]
    >,
    currentProject: Project | undefined,
    pathname: string
): string => {
    const [, path] = pathname.split('/').filter((token) => token.length);
    let toVisit = `/new`;

    if (allProjects) {
        if (allProjects[0]?.id !== currentProject?.id) {
            toVisit = `/${allProjects[0]?.id}/${path}`;
        } else {
            toVisit = `/${allProjects[allProjects.length - 1]?.id}/${path}`;
        }
    }

    return toVisit;
};
