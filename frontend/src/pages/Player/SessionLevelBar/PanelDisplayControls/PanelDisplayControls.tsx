import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import React from 'react';
import Button from '../../../../components/Button/Button/Button';
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

    return (
        <div className={styles.buttonContainer}>
            <PanelButton
                onClick={() => {
                    setOpenDevTools(!openDevTools);
                }}
            >
                <SvgPanelBottomIcon
                    className={classNames([{ [styles.active]: openDevTools }])}
                />
            </PanelButton>
            <PanelButton
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
    }>
) => (
    <Button type="text" className={styles.button} onClick={props.onClick}>
        {props.children}
    </Button>
);
