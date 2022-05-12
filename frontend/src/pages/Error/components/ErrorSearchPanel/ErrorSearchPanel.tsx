import ErrorQueryBuilder from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder';
import { ErrorFeedV2 } from '@pages/Errors/ErrorFeedV2/ErrorFeedV2';
import classNames from 'classnames';
import React from 'react';

import PanelToggleButton from '../../../Player/components/PanelToggleButton/PanelToggleButton';
import useErrorPageConfiguration from '../../utils/ErrorPageUIConfiguration';
import SegmentPickerForErrors from '../SegmentPickerForErrors/SegmentPickerForErrors';
import styles from './ErrorSearchPanel.module.scss';

const ErrorSearchPanel = () => {
    const { setShowLeftPanel, showLeftPanel } = useErrorPageConfiguration();

    return (
        <aside
            className={classNames(styles.errorSearchPanel, {
                [styles.hidden]: !showLeftPanel,
            })}
        >
            {showLeftPanel && (
                <div className={styles.searchContainer}>
                    <div className={styles.filtersContainer}>
                        <SegmentPickerForErrors />
                        <ErrorQueryBuilder />
                    </div>
                    <ErrorFeedV2 />
                </div>
            )}
            <PanelToggleButton
                direction="left"
                className={classNames(styles.panelToggleButton, {
                    [styles.hidden]: !showLeftPanel,
                })}
                isOpen={showLeftPanel}
                onClick={() => {
                    setShowLeftPanel(!showLeftPanel);
                }}
            />
        </aside>
    );
};

export default ErrorSearchPanel;
