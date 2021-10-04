import { MiniWorkspaceIcon } from '@components/Header/WorkspaceDropdown/WorkspaceDropdown';
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
    const history = useHistory();
    const { pathname } = useLocation();

    const newProjectOption = {
        value: '-1',
        displayValue: (
            <span className={styles.createNewApplicationOption}>
                <span>Create New Project</span>
                <SvgPlusIcon />
            </span>
        ),
        id: '-1',
    };

    const workspaceSettingsOption = {
        value: '-2',
        displayValue: (
            <span className={styles.createNewApplicationOption}>
                <span>Workspace Settings</span>
                <SvgSettingsIcon />
            </span>
        ),
        id: '-2',
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
                          {project?.name || ''}
                      </span>
                  ),
                  id: project?.id || '',
              }))
            : []),
        newProjectOption,
        workspaceSettingsOption,
    ];

    return (
        <div>
            <TextSelect
                defaultValue={currentProject?.id}
                displayValue={currentProject?.name}
                options={applicationOptions}
                onChange={(projectId) => {
                    if (projectId === newProjectOption.value) {
                        history.push('/new');
                    } else if (projectId === workspaceSettingsOption.value) {
                        history.push(`/w/${currentWorkspace!.id}/settings`);
                    } else {
                        const [, path] = pathname
                            .split('/')
                            .filter((token) => token.length);

                        history.push(`/${projectId}/${path}`);
                    }
                }}
            />
            {currentWorkspace?.name}
        </div>
    );
};

export default ApplicationPicker;
