import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import React from 'react';

import Button from '../../../../components/Button/Button/Button';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import useHighlightAdminFlag from '../../../../hooks/useHighlightAdminFlag/useHighlightAdminFlag';
import SvgPanelBottomIcon from '../../../../static/PanelBottomIcon';
import SvgPanelRightIcon from '../../../../static/PanelRightIcon';
import styles from './PanelDisplayControls.module.scss';

const PanelDisplayControls = () => {
    const [openDevTools, setOpenDevTools] = useLocalStorage(
        'highlightMenuOpenDevTools',
        false
    );
    const [
        showRightPanelPreference,
        setShowRightPanelPreference,
    ] = useLocalStorage('highlightMenuShowRightPanel', true);
    const [
        showLeftPanelPreference,
        setShowLeftPanelPreference,
    ] = useLocalStorage('highlightMenuShowLeftPanel', true);
    const { isHighlightAdmin } = useHighlightAdminFlag();

    return (
        <div className={styles.buttonContainer}>
            {isHighlightAdmin && (
                <PanelButton
                    tooltipText="Activate the Sessions panel to search for sessions."
                    onClick={() => {
                        setShowLeftPanelPreference(!showLeftPanelPreference);
                    }}
                >
                    <SvgPanelRightIcon
                        className={classNames([
                            { [styles.active]: showLeftPanelPreference },
                            styles.leftPanelIcon,
                        ])}
                    />
                </PanelButton>
            )}
            <PanelButton
                tooltipText="Activate the DevTools to see console logs, errors, and network requests."
                onClick={() => {
                    setOpenDevTools(!openDevTools);
                }}
            >
                <SvgPanelBottomIcon
                    className={classNames([{ [styles.active]: openDevTools }])}
                />
            </PanelButton>
            <PanelButton
                tooltipText="Activate the Inspect panel to view session event details and user metadata."
                onClick={() => {
                    setShowRightPanelPreference(!showRightPanelPreference);
                }}
            >
                <SvgPanelRightIcon
                    className={classNames([
                        { [styles.active]: showRightPanelPreference },
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
        <Button type="text" className={styles.button} onClick={props.onClick}>
            {props.children}
        </Button>
    </Tooltip>
);
