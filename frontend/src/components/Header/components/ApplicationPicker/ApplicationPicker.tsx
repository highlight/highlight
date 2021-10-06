import { useAuthContext } from '@authentication/AuthContext';
import { MiniWorkspaceIcon } from '@components/Header/WorkspaceDropdown/WorkspaceDropdown';
import SvgArrowRightIcon from '@icons/ArrowRightIcon';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useApplicationContext } from '../../../../routers/OrgRouter/ApplicationContext';
import SvgPlusIcon from '../../../../static/PlusIcon';
import SvgSettingsIcon from '../../../../static/SettingsIcon';
import TextSelect from '../../../Select/TextSelect/TextSelect';
import styles from './ApplicationPicker.module.scss';

const ApplicationPicker = () => {
    const {
        allProjects,
        currentProject,
        currentWorkspace,
    } = useApplicationContext();
    const { workspace_id } = useParams<{
        workspace_id: string;
    }>();
    const isWorkspaceLevel = workspace_id !== undefined;
    const history = useHistory();
    const { pathname } = useLocation();
    const { isHighlightAdmin } = useAuthContext();

    const newProjectOption = {
        value: '-1',
        displayValue: (
            <span className={styles.createNewProjectOption}>
                <SvgPlusIcon />
                <span>Create New Project</span>
            </span>
        ),
        id: '-1',
    };

    const switchWorkspaceOption = {
        value: '-2',
        displayValue: (
            <span className={styles.createNewProjectOption}>
                <SvgArrowRightIcon />
                <span>Switch Workspace</span>
            </span>
        ),
        id: '-2',
    };

    const workspaceSettingsOption = {
        value: '-3',
        displayValue: (
            <span
                className={classNames(styles.createNewProjectOption, {
                    [styles.selected]: isWorkspaceLevel,
                })}
            >
                <SvgSettingsIcon />
                <span>Workspace Settings</span>
            </span>
        ),
        id: '-3',
    };

    const applicationOptions = [
        ...(allProjects
            ? allProjects.map((project) => ({
                  value: project?.id || '',
                  displayValue: (
                      <span className={styles.existingProjectOption}>
                          <MiniWorkspaceIcon
                              projectName={project?.name || ''}
                          />
                          <span>{project?.name || ''}</span>
                      </span>
                  ),
                  id: project?.id || '',
              }))
            : []),
        newProjectOption,
        ...(isHighlightAdmin ? [switchWorkspaceOption] : []),
        workspaceSettingsOption,
    ];

    return (
        <div>
            <TextSelect
                defaultValue={
                    isWorkspaceLevel
                        ? workspaceSettingsOption.value
                        : currentProject?.id
                }
                displayValue={
                    isWorkspaceLevel
                        ? 'Workspace Settings'
                        : currentProject?.name
                }
                options={applicationOptions}
                onChange={(projectId) => {
                    if (!currentWorkspace) {
                        history.push('/');
                    } else if (projectId === newProjectOption.value) {
                        history.push(`/w/${currentWorkspace!.id}/new`);
                    } else if (projectId === workspaceSettingsOption.value) {
                        history.push(`/w/${currentWorkspace!.id}/team`);
                    } else if (projectId === switchWorkspaceOption.value) {
                        history.push(`/switch`);
                    } else {
                        const path = isWorkspaceLevel
                            ? ''
                            : pathname
                                  .split('/')
                                  .filter((token) => token.length)[1];
                        history.push(`/${projectId}/${path}`);
                    }
                }}
            />
            <span className={styles.subTitle}>{currentWorkspace?.name}</span>
        </div>
    );
};

export default ApplicationPicker;
