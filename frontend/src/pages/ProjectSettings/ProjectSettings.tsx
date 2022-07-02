import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import Tabs from '@components/Tabs/Tabs';
import { DangerForm } from '@pages/ProjectSettings/DangerForm/DangerForm';
import { ErrorSettingsForm } from '@pages/ProjectSettings/ErrorSettingsForm/ErrorSettingsForm';
import { ExcludedUsersForm } from '@pages/ProjectSettings/ExcludedUsersForm/ExcludedUsersForm';
import { NetworkRecordingForm } from '@pages/ProjectSettings/NetworkRecordingForm/NetworkRecordingForm';
import { RageClicksForm } from '@pages/ProjectSettings/RageClicksForm/RageClicksForm';
import SourcemapSettings from '@pages/WorkspaceSettings/SourcemapSettings/SourcemapSettings';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import styles from './ProjectSettings.module.scss';

const ProjectSettings = () => {
    const match = useRouteMatch();

    return (
        <>
            <Helmet>
                <title>Project Settings</title>
            </Helmet>

            <LeadAlignLayout>
                <h2>Project Settings</h2>

                <Route
                    path={`${match.path}/:tab?/:section?`}
                    render={({ history, match: tabsMatch }) => {
                        const section = tabsMatch.params.section;
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
                                                        <ExcludedUsersForm
                                                            focus={
                                                                section ===
                                                                'users'
                                                            }
                                                        />
                                                        <RageClicksForm
                                                            focus={
                                                                section ===
                                                                'rage'
                                                            }
                                                        />
                                                        <NetworkRecordingForm
                                                            focus={
                                                                section ===
                                                                'network'
                                                            }
                                                        />
                                                    </>
                                                ),
                                            },
                                            {
                                                key: 'errors',
                                                title: 'Errors',
                                                panelContent: (
                                                    <>
                                                        <ErrorSettingsForm
                                                            focus={
                                                                section ===
                                                                'errors'
                                                            }
                                                        />
                                                        <SourcemapSettings
                                                            focus={
                                                                section ===
                                                                'sourcemaps'
                                                            }
                                                        />
                                                    </>
                                                ),
                                            },
                                            {
                                                key: 'general',
                                                title: 'General',
                                                panelContent: <DangerForm />,
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
