import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useGetBillingDetailsForProjectQuery } from '@graph/hooks';
import SvgXIcon from '@icons/XIcon';
import useLocalStorage from '@rehooks/local-storage';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext';
import { useIntegrated } from '@util/integrated';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames/bind';
import { H } from 'highlight.run';
import moment from 'moment';
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSessionStorage } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import { Maybe, PlanType, Project } from '../../graph/generated/schemas';
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
    const { showBanner } = useGlobalContext();

    return (
        <>
            <CommandBar />
            <div
                className={classNames(styles.header, {
                    [styles.guest]:
                        !isLoggedIn &&
                        projectIdRemapped !==
                            DEMO_WORKSPACE_PROXY_APPLICATION_ID,
                    [styles.bannerShown]: showBanner,
                })}
            >
                {!!project_id && getBanner(project_id)}
                <div className={styles.headerContent}>
                    {isLoggedIn ||
                    projectIdRemapped ===
                        DEMO_WORKSPACE_PROXY_APPLICATION_ID ? (
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
                        {!isLoggedIn ? (
                            <ButtonLink
                                className={styles.upsellButton}
                                trackingId="DemoProjectSignUp"
                                to="/?sign_up=1"
                            >
                                Get 4 months of Highlight free!
                            </ButtonLink>
                        ) : (
                            <FeedbackButton />
                        )}
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
    const { toggleShowBanner } = useGlobalContext();
    const [temporarilyHideBanner, setTemporarilyHideBanner] = useSessionStorage(
        'highlightHideFreePlanBanner',
        false
    );
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetBillingDetailsForProjectQuery({
        variables: { project_id },
    });
    const [
        hasReportedTrialExtension,
        setHasReportedTrialExtension,
    ] = useLocalStorage('highlightReportedTrialExtension', false);
    const { integrated } = useIntegrated();

    useEffect(() => {
        if (
            !hasReportedTrialExtension &&
            data?.workspace_for_project?.trial_extension_enabled
        ) {
            H.track('TrialExtensionEnabled', {
                project_id,
                workspace_id: data?.workspace_for_project.id,
            });
            setHasReportedTrialExtension(true);
        }
    }, [
        data?.workspace_for_project?.id,
        data?.workspace_for_project?.trial_extension_enabled,
        hasReportedTrialExtension,
        project_id,
        setHasReportedTrialExtension,
    ]);

    if (loading) {
        toggleShowBanner(false);
        return null;
    }

    if (data?.billingDetailsForProject.plan.type !== PlanType.Free) {
        toggleShowBanner(false);
        return null;
    }

    if (project_id === DEMO_WORKSPACE_APPLICATION_ID) {
        toggleShowBanner(false);
        return null;
    }

    if (temporarilyHideBanner) {
        toggleShowBanner(false);
        return null;
    }

    let bannerMessage:
        | string
        | React.ReactNode = `You've used ${data?.billingDetailsForProject.meter}/${data?.billingDetailsForProject.plan.quota} of your free sessions.`;
    const hasTrial = isProjectWithinTrial(data?.workspace_for_project);
    const canExtend = data?.workspace_for_project?.eligible_for_trial_extension;

    if (hasTrial) {
        bannerMessage = `You have unlimited sessions until ${moment(
            data?.workspace_for_project?.trial_end_date
        ).format('MM/DD/YY')}. `;

        if (canExtend) {
            if (integrated) {
                bannerMessage = (
                    <>
                        You're currently on a 2 week unlimited trial.{' '}
                        <Link
                            className={styles.trialLink}
                            to={`/w/${data?.workspace_for_project?.id}/about-you`}
                        >
                            Tell us about yourself
                        </Link>{' '}
                        by{' '}
                        {moment(
                            data?.workspace_for_project?.trial_end_date
                        ).format('MM/DD')}{' '}
                        to get 4 months of free Highlight!
                    </>
                );
            } else {
                bannerMessage = (
                    <>
                        You're currently on a 2 week unlimited trial.{' '}
                        <Link
                            className={styles.trialLink}
                            to={`/${project_id}/setup`}
                        >
                            Integrate Highlight
                        </Link>{' '}
                        by{' '}
                        {moment(
                            data?.workspace_for_project?.trial_end_date
                        ).format('MM/DD')}{' '}
                        to get 4 months of free Highlight!
                    </>
                );
            }
        }
    }

    toggleShowBanner(true);

    return (
        <div className={styles.trialWrapper}>
            <div className={classNames(styles.trialTimeText)}>
                {bannerMessage}
                {!canExtend && (
                    <>
                        {' '}
                        Upgrade{' '}
                        <Link
                            className={styles.trialLink}
                            to={`/w/${data?.workspace_for_project?.id}/billing`}
                        >
                            here!
                        </Link>
                    </>
                )}
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
    const { toggleShowBanner } = useGlobalContext();
    toggleShowBanner(true);

    return (
        <div
            className={styles.trialWrapper}
            style={{
                backgroundColor: 'var(--color-primary-inverted-background)',
            }}
        >
            <div className={classNames(styles.trialTimeText)}>
                Running Highlight On-premise{' '}
                {`v${process.env.REACT_APP_COMMIT_SHA}`}
            </div>
        </div>
    );
};

const DemoWorkspaceBanner = () => {
    const { currentProject, allProjects } = useApplicationContext();
    const { pathname } = useLocation();
    const { toggleShowBanner } = useGlobalContext();

    const redirectLink = getRedirectLink(allProjects, currentProject, pathname);

    toggleShowBanner(true);

    return (
        <div
            className={styles.trialWrapper}
            style={{
                background: 'var(--color-primary-inverted-background)',
            }}
        >
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
