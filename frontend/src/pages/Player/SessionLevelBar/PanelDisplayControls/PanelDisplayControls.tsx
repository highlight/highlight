import classNames from 'classnames';
import React from 'react';

import { useAuthContext } from '../../../../AuthContext';
import Button from '../../../../components/Button/Button/Button';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import SvgPanelBottomIcon from '../../../../static/PanelBottomIcon';
import SvgPanelRightIcon from '../../../../static/PanelRightIcon';
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration';
import styles from './PanelDisplayControls.module.scss';

const PanelDisplayControls = () => {
    const {
        showLeftPanel,
        setShowLeftPanel,
        showDevTools,
        setShowDevTools,
        showRightPanel,
        setShowRightPanel,
    } = usePlayerConfiguration();
    const { isLoggedIn } = useAuthContext();
    if (!isLoggedIn && showLeftPanel) {
        setShowLeftPanel(false);
    }

    return (
        <div className={styles.buttonContainer}>
            {isLoggedIn && (
                <PanelButton
                    tooltipText="Activate the Sessions panel to search for sessions."
                    onClick={() => {
                        setShowLeftPanel(!showLeftPanel);
                    }}
                >
                    <SvgPanelRightIcon
                        className={classNames([
                            { [styles.active]: showLeftPanel },
                            styles.leftPanelIcon,
                        ])}
                    />
                </PanelButton>
            )}
            <PanelButton
                tooltipText="Activate the DevTools to see console logs, errors, and network requests."
                onClick={() => {
                    setShowDevTools(!showDevTools);
                }}
            >
                <SvgPanelBottomIcon
                    className={classNames([{ [styles.active]: showDevTools }])}
                />
            </PanelButton>
            <PanelButton
                tooltipText="Activate the Inspect panel to view session event details and user metadata."
                onClick={() => {
                    setShowRightPanel(!showRightPanel);
                }}
            >
                <SvgPanelRightIcon
                    className={classNames([
                        { [styles.active]: showRightPanel },
                    ])}
                />
            </PanelButton>
        </div>
    );
};

export default PanelDisplayControls;

const PanelButton = (
    props: React.PropsWithChildren<{
        onClick: React.MouseEventHandler<HTMLElement>;
        tooltipText: string;
    }>
) => (
    <Tooltip
        title={props.tooltipText}
        placement="bottomRight"
        arrowPointAtCenter
    >
        <Button
            type="text"
            className={styles.button}
            onClick={props.onClick}
            trackingId="PanelDisplay"
        >
            {props.children}
        </Button>
    </Tooltip>
);
