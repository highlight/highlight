import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import Tabs from '@components/Tabs/Tabs';
import { DangerForm } from '@pages/WorkspaceSettings/DangerForm/DangerForm';
import { ErrorSettingsForm } from '@pages/WorkspaceSettings/ErrorSettingsForm/ErrorSettingsForm';
import { ExcludedUsersForm } from '@pages/WorkspaceSettings/ExcludedUsersForm/ExcludedUsersForm';
import { FieldsForm } from '@pages/WorkspaceSettings/FieldsForm/FieldsForm';
import { RageClicksForm } from '@pages/WorkspaceSettings/RageClicksForm/RageClicksForm';
import classNames from 'classnames';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import styles from './WorkspaceSettings.module.scss';

const ProjectSettings = () => {
    const match = useRouteMatch();
    console.log('match', match);

    return (
        <>
            <Helmet>
                <title>Workspace Settings</title>
            </Helmet>

            <LeadAlignLayout>
                <h2>Workspace Settings</h2>

                <Route
                    path={`${match.path}/:tab?`}
                    render={({ history, match: tabsMatch }) => {
                        console.log('tabsMatch', tabsMatch);
                        return (
                            <div className={styles.tabsContainer}>
                                <Switch>
                                    <Tabs
                                        activeKeyOverride={
                                            tabsMatch.params.tab || 'recording'
                                        }
                                        onChange={(key) => {
                                            history.push(`${match.url}/${key}`);
                                        }}
                                        noHeaderPadding
                                        noPadding
                                        id="settingsTabs"
                                        tabs={[
                                            {
                                                key: 'recording',
                                                title: 'Recording',
                                                panelContent: (
                                                    <>
                                                        <div
                                                            className={
                                                                styles.fieldsBox
                                                            }
                                                        >
                                                            <h3>
                                                                Excluded
                                                                Sessions
                                                            </h3>
                                                            <ExcludedUsersForm />
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.fieldsBox
                                                            }
                                                        >
                                                            <h3>Rage Clicks</h3>
                                                            <RageClicksForm />
                                                        </div>
                                                    </>
                                                ),
                                            },
                                            {
                                                key: 'errors',
                                                title: 'Errors',
                                                panelContent: (
                                                    <>
                                                        <div
                                                            className={
                                                                styles.fieldsBox
                                                            }
                                                        >
                                                            <h3>
                                                                Error Grouping
                                                            </h3>
                                                            <ErrorSettingsForm />
                                                        </div>
                                                    </>
                                                ),
                                            },
                                            {
                                                key: 'general',
                                                title: 'General',
                                                panelContent: (
                                                    <>
                                                        <div
                                                            className={
                                                                styles.fieldsBox
                                                            }
                                                        >
                                                            <h3>
                                                                Project
                                                                Properties
                                                            </h3>
                                                            <FieldsForm />
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.fieldsBox
                                                            }
                                                        >
                                                            <h3
                                                                className={classNames(
                                                                    styles.dangerTitle
                                                                )}
                                                            >
                                                                Danger Zone
                                                            </h3>
                                                            <DangerForm />
                                                        </div>
                                                    </>
                                                ),
                                            },
                                        ]}
                                    />
                                </Switch>
                            </div>
                        );
                    }}
                />
            </LeadAlignLayout>
        </>
    );
};

export default ProjectSettings;
