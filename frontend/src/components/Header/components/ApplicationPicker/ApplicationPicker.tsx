import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useApplicationContext } from '../../../../routers/OrgRouter/ApplicationContext';
import SvgPlusIcon from '../../../../static/PlusIcon';
import TextSelect from '../../../Select/TextSelect/TextSelect';
import styles from './ApplicationPicker.module.scss';

const ApplicationPicker = () => {
    const { allApplications, currentApplication } = useApplicationContext();
    const history = useHistory();
    const { pathname } = useLocation();

    const newApplicationOption = {
        value: '-1',
        displayValue: (
            <span className={styles.createNewApplicationOption}>
                <span>Create New Workspace</span>
                <SvgPlusIcon />
            </span>
        ),
        id: '-1',
    };

    const applicationOptions = [
        ...(allApplications
            ? allApplications.map((application) => ({
                  value: application?.id || '',
                  displayValue: <>{application?.name || ''}</>,
                  id: application?.id || '',
              }))
            : []),
        newApplicationOption,
    ];

    return (
        <div>
            <TextSelect
                defaultValue={currentApplication?.id}
                options={applicationOptions}
                onChange={(applicationId) => {
                    if (applicationId === newApplicationOption.value) {
                        history.push('/new');
                    } else {
                        const [, path] = pathname
                            .split('/')
                            .filter((token) => token.length);

                        history.push(`/${applicationId}/${path}`);
                    }
                }}
            />
        </div>
    );
};

export default ApplicationPicker;
