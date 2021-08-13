import React from 'react';

import Card from '../../../../components/Card/Card';
import Tabs from '../../../../components/Tabs/Tabs';
import { GetErrorGroupQuery } from '../../../../graph/generated/operations';
import ErrorComments from '../ErrorComments/ErrorComments';
import ErrorFullCommentList from './components/ErrorFullCommentList/ErrorFullCommentList';
import ErrorMetadata from './components/ErrorMetadata/ErrorMetadata';
import styles from './ErrorRightPanel.module.scss';

interface Props {
    errorGroup?: GetErrorGroupQuery;
}

const ErrorRightPanel = ({ errorGroup }: Props) => {
    return (
        <Card noPadding className={styles.rightPanel}>
            <Tabs
                centered
                noPadding
                tabs={[
                    {
                        title: 'Metadata',
                        panelContent: (
                            <div className={styles.tabContainer}>
                                <ErrorMetadata errorGroup={errorGroup} />
                            </div>
                        ),
                    },
                    {
                        title: 'Comments',
                        panelContent: (
                            <div className={styles.commentsTabContainer}>
                                <div className={styles.createCommentContainer}>
                                    <ErrorComments />
                                </div>
                                <ErrorFullCommentList />
                            </div>
                        ),
                    },
                ]}
                id="ErrorPageRightPanel"
            />
        </Card>
    );
};

export default ErrorRightPanel;
